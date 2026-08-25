from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import AssignedTask, Milestone, Project, Task
from .models import Submission

User = get_user_model()


class TimesheetEntryAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='timesheet_user', email='timesheet@example.com', password='Pass123!')
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(name='pr1', quotation='Q-001')
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
