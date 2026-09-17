from datetime import date, timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Self_Ticket, Self_Ticket_Log, Ticket, Ticket_Log
from .services.self_ticket_reminders import send_self_ticket_reminders
from users.models import DepartmentManager, UserProfile


User = get_user_model()


class TicketCrudApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="ticket.creator",
            password="pass12345",
            first_name="Ticket",
            email="creator@example.com",
            is_staff=True,
        )
        self.assigned_to = User.objects.create_user(
            username="ticket.owner",
            password="pass12345",
            first_name="Owner",
            email="owner@example.com",
            is_staff=True,
        )
        self.department = Group.objects.create(name="Engineering")
        self.client.force_authenticate(user=self.user)

    def ticket_payload(self, **overrides):
        payload = {
            "task": "Prepare FDS review",
            "description": "Review FDS document and confirm comments.",
            "department": self.department.id,
            "assigned_to": self.assigned_to.id,
            "est_hours": "4.50",
            "target_date": (date.today() + timedelta(days=3)).isoformat(),
            "priority": "medium",
            "current_status": "open",
        }
        payload.update(overrides)
        return payload

    def create_ticket(self, **overrides):
        response = self.client.post(
            "/api/tickets/",
            self.ticket_payload(**overrides),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        return response

    def test_create_ticket_creates_number_and_initial_log(self):
        response = self.create_ticket()

        ticket = Ticket.objects.get(id=response.data["id"])
        self.assertTrue(ticket.number.startswith("TM-"))
        self.assertEqual(ticket.creator, self.user)
        self.assertEqual(ticket.assigned_to, self.assigned_to)
        self.assertEqual(Ticket_Log.objects.filter(ticket=ticket).count(), 1)

        log = Ticket_Log.objects.get(ticket=ticket)
        self.assertEqual(log.status, "open")
        self.assertEqual(log.changed_by, self.user)
        self.assertEqual(log.assigned_to, self.assigned_to)

    def test_list_and_retrieve_ticket(self):
        create_response = self.create_ticket(task="Listable ticket")

        list_response = self.client.get("/api/tickets/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK, list_response.data)
        self.assertGreaterEqual(len(list_response.data), 1)

        detail_response = self.client.get(f"/api/tickets/{create_response.data['id']}/")
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK, detail_response.data)
        self.assertEqual(detail_response.data["task"], "Listable ticket")
        self.assertEqual(detail_response.data["creator"], self.user.id)

    def test_update_ticket_changes_status_and_adds_log(self):
        create_response = self.create_ticket()
        ticket_id = create_response.data["id"]

        response = self.client.patch(
            f"/api/tickets/{ticket_id}/",
            {
                "current_status": "in progress",
                "remarks": "Work started.",
                "deleted_file_ids": "[]",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        ticket = Ticket.objects.get(id=ticket_id)
        self.assertEqual(ticket.current_status, "in progress")
        self.assertEqual(Ticket_Log.objects.filter(ticket=ticket).count(), 2)
        self.assertTrue(
            Ticket_Log.objects.filter(
                ticket=ticket,
                status="in progress",
                remarks="Work started.",
                changed_by=self.user,
            ).exists()
        )

    def test_delete_ticket_removes_record(self):
        create_response = self.create_ticket()
        ticket_id = create_response.data["id"]

        response = self.client.delete(f"/api/tickets/{ticket_id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT, response.data)
        self.assertFalse(Ticket.objects.filter(id=ticket_id).exists())

    def test_create_ticket_requires_department_and_assigned_user(self):
        response = self.client.post(
            "/api/tickets/",
            self.ticket_payload(department=None, assigned_to=None),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("department", response.data)
        self.assertIn("assigned_to", response.data)

    def test_department_manager_can_create_internal_ticket_for_immediate_reportee(self):
        UserProfile.objects.create(user=self.user, dept_role=False)
        UserProfile.objects.create(user=self.assigned_to, reporting_to=self.user)
        DepartmentManager.objects.create(department=self.department, manager=self.user)

        response = self.create_ticket(is_internal=True)

        ticket = Ticket.objects.get(id=response.data["id"])
        self.assertTrue(ticket.is_internal)
        self.assertEqual(ticket.assigned_to, self.assigned_to)

    def test_internal_ticket_requires_immediate_reportee(self):
        UserProfile.objects.create(user=self.user, dept_role=True)
        UserProfile.objects.create(user=self.assigned_to)

        response = self.client.post(
            "/api/tickets/",
            self.ticket_payload(is_internal=True),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("assigned_to", response.data)

    def test_internal_ticket_requires_manager_or_lead(self):
        UserProfile.objects.create(user=self.user, dept_role=False)
        UserProfile.objects.create(user=self.assigned_to, reporting_to=self.user)

        response = self.client.post(
            "/api/tickets/",
            self.ticket_payload(is_internal=True),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("is_internal", response.data)


class SelfTicketCrudApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="self.creator",
            password="pass12345",
            first_name="Self",
            email="self@example.com",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.user)

    def self_ticket_payload(self, **overrides):
        payload = {
            "task": "Follow up internal checklist",
            "description": "Complete pending ICProDesk internal checklist.",
            "est_hours": "2.00",
            "target_date": (date.today() + timedelta(days=2)).isoformat(),
            "priority": "low",
            "current_status": "open",
            "type": "open",
            "ticket_number": "",
            "reminder_interval": 1,
        }
        payload.update(overrides)
        return payload

    def create_self_ticket(self, **overrides):
        response = self.client.post(
            "/api/self-tickets/",
            self.self_ticket_payload(**overrides),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        return response

    def test_create_self_ticket_creates_number_and_creator(self):
        response = self.create_self_ticket()

        self_ticket = Self_Ticket.objects.get(id=response.data["id"])
        self.assertTrue(self_ticket.number.startswith("DL-"))
        self.assertEqual(self_ticket.creator, self.user)
        self.assertEqual(self_ticket.current_status, "open")
        self.assertFalse(self_ticket.alarm)

    def test_acknowledge_alarm_resets_self_ticket_alarm(self):
        response = self.create_self_ticket()
        self_ticket = Self_Ticket.objects.get(id=response.data["id"])
        self_ticket.alarm = True
        self_ticket.save(update_fields=["alarm"])

        response = self.client.post(
            f"/api/self-tickets/{self_ticket.id}/acknowledge-alarm/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self_ticket.refresh_from_db()
        self.assertFalse(self_ticket.alarm)

    @patch("tickets.services.self_ticket_reminders.send_mail")
    def test_self_ticket_reminder_job_sets_due_alarm(self, mock_send_mail):
        response = self.create_self_ticket(reminder_interval=2)
        self_ticket = Self_Ticket.objects.get(id=response.data["id"])
        Self_Ticket.objects.filter(id=self_ticket.id).update(
            created_at=date.today() - timedelta(days=4),
            alarm=False,
        )
        self_ticket.refresh_from_db()

        reminded_tickets = send_self_ticket_reminders(date.today())

        self_ticket.refresh_from_db()
        self.assertEqual([ticket.id for ticket in reminded_tickets], [self_ticket.id])
        self.assertTrue(self_ticket.alarm)
        mock_send_mail.assert_called_once()
        self.assertEqual(mock_send_mail.call_args.args[2], ["self@example.com"])
        self.assertIn(self_ticket.number, mock_send_mail.call_args.args[0])

    def test_list_and_retrieve_self_ticket(self):
        create_response = self.create_self_ticket(task="Listable self ticket")

        list_response = self.client.get("/api/self-tickets/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK, list_response.data)
        self.assertGreaterEqual(len(list_response.data), 1)

        detail_response = self.client.get(f"/api/self-tickets/{create_response.data['id']}/")
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK, detail_response.data)
        self.assertEqual(detail_response.data["task"], "Listable self ticket")
        self.assertEqual(detail_response.data["creator"], self.user.id)

    def test_update_self_ticket_adds_comment_log(self):
        create_response = self.create_self_ticket()
        self_ticket_id = create_response.data["id"]

        response = self.client.patch(
            f"/api/self-tickets/{self_ticket_id}/",
            {
                "current_status": "in progress",
                "comments": "Started the checklist.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self_ticket = Self_Ticket.objects.get(id=self_ticket_id)
        self.assertEqual(self_ticket.current_status, "in progress")
        self.assertTrue(
            Self_Ticket_Log.objects.filter(
                self_ticket=self_ticket,
                comments="Started the checklist.",
                creator=self.user,
            ).exists()
        )

    def test_delete_self_ticket_removes_record(self):
        create_response = self.create_self_ticket()
        self_ticket_id = create_response.data["id"]

        response = self.client.delete(f"/api/self-tickets/{self_ticket_id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT, response.data)
        self.assertFalse(Self_Ticket.objects.filter(id=self_ticket_id).exists())
