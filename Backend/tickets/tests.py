from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Self_Ticket, Self_Ticket_Log, Ticket, Ticket_Log


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
