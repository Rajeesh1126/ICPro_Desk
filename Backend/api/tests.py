from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import AssignedTask, Milestone, Project, Task
from .models import Submission, TimesheetStatus

User = get_user_model()


class TimesheetEntryAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='timesheet_user', email='timesheet@example.com', password='Pass123!')
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(name='pr1', quotation_id=1, description='Q-001')
        self.milestone = Milestone.objects.create(project=self.project, name='mile1')
        self.task = Task.objects.create(project=self.project, name='task1', milestone=self.milestone)
        self.assigned_task = AssignedTask.objects.create(
            assign_to=self.user,
            project_obj=self.project,
            task_obj=self.task,
            milestone_obj=self.milestone,
        )
        Submission.objects.create(assignId=self.assigned_task, date=date(2026, 8, 3), hours=4)
        Submission.objects.create(assignId=self.assigned_task, date=date(2026, 8, 4), hours=5)

    def test_timesheet_entries_endpoint_returns_nested_project_data(self):
        response = self.client.get('/api/timesheet-entries/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'pr1')
        self.assertEqual(response.data[0]['milestones'][0]['name'], 'mile1')
        self.assertEqual(response.data[0]['milestones'][0]['assigned_tasks'][0]['assign_id'], self.assigned_task.id)
        self.assertEqual(response.data[0]['milestones'][0]['assigned_tasks'][0]['name'], 'task1')
        self.assertEqual(response.data[0]['milestones'][0]['assigned_tasks'][0]['entries']['2026-08-03'], 4)
        self.assertEqual(response.data[0]['milestones'][0]['assigned_tasks'][0]['entries']['2026-08-04'], 5)

    def test_timesheet_entries_endpoint_always_includes_others_project(self):
        other_user = User.objects.create_user(username='other_user', email='other@example.com', password='Pass123!')
        self.client.force_authenticate(user=other_user)

        others_project = Project.objects.create(name='Others', description='Non project activities')
        others_milestone = Milestone.objects.create(project=others_project, name='General')
        Task.objects.create(project=others_project, name='Leave', milestone=others_milestone)

        response = self.client.get('/api/timesheet-entries/?week_start=2026-08-03')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Others')
        self.assertEqual(response.data[0]['milestones'][0]['assigned_tasks'][0]['name'], 'Leave')
        self.assertTrue(
            AssignedTask.objects.filter(
                assign_to=other_user,
                project_obj=others_project,
                task_obj__name='Leave',
            ).exists()
        )

    def test_submit_endpoint_saves_entries_and_weekly_status(self):
        response = self.client.post(
            '/api/timesheet-entries/submit/',
            {
                'week_start': '2026-08-03',
                'comments': 'Ready for approval',
                'entries': [
                    {
                        'assignId': self.assigned_task.id,
                        'date': '2026-08-03',
                        'hours': 8,
                    },
                    {
                        'assignId': self.assigned_task.id,
                        'date': '2026-08-05',
                        'hours': 6,
                    },
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            Submission.objects.filter(
                assignId=self.assigned_task,
                date=date(2026, 8, 3),
                hours=8,
                status='Submitted',
            ).exists()
        )
        self.assertTrue(
            TimesheetStatus.objects.filter(
                uid=self.user,
                timesheet_status='Submitted',
                weeknumber=32,
                weekyear=2026,
                comments='Ready for approval',
                submission_status=True,
            ).exists()
        )

    def test_current_timesheet_status_endpoint_returns_week_status(self):
        TimesheetStatus.objects.create(
            uid=self.user,
            timesheet_status='Submitted',
            weeknumber=32,
            weekyear=2026,
            submission_status=True,
            comments='Already submitted',
        )

        response = self.client.get('/api/timesheet-statuses/current/?week_start=2026-08-03')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['timesheet_status'], 'Submitted')
        self.assertEqual(response.data['weeknumber'], 32)
        self.assertEqual(response.data['weekyear'], 2026)
        self.assertEqual(response.data['comments'], 'Already submitted')

    def test_request_unlock_creates_weekly_requested_status(self):
        response = self.client.post(
            '/api/timesheet-statuses/request-unlock/',
            {
                'week_start': '2026-08-03',
                'unlock_reason': 'Missed Friday entry',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            TimesheetStatus.objects.filter(
                uid=self.user,
                timesheet_status='Requested',
                weeknumber=32,
                weekyear=2026,
                unlock_reason='Missed Friday entry',
            ).exists()
        )

    def test_request_unlock_rejects_submitted_week(self):
        TimesheetStatus.objects.create(
            uid=self.user,
            timesheet_status='Submitted',
            weeknumber=32,
            weekyear=2026,
            submission_status=True,
        )

        response = self.client.post(
            '/api/timesheet-statuses/request-unlock/',
            {
                'week_start': '2026-08-03',
                'unlock_reason': 'Need update',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
