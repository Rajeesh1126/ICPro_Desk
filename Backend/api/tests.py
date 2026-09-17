from datetime import date, datetime
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import AssignedTask, Milestone, Project, Task
from tickets.models import Ticket
from users.models import Role, UserProfile
from .models import Submission, TimesheetWeekLog
from .services.timesheet_reminders import (
    send_daily_timesheet_reminders,
    send_weekly_timesheet_submission_reminders,
)
from .views import _sync_timesheet_status

User = get_user_model()


class TimesheetReminderTests(APITestCase):
    def setUp(self):
        self.employee_role = Role.objects.create(name='Employee')
        self.ceo_role = Role.objects.create(name='CEO')
        self.manager = User.objects.create_user(username='reminder_manager', email='manager@example.com')
        self.missing_user = User.objects.create_user(
            username='missing_user',
            email='missing@example.com',
            first_name='Missing',
        )
        self.filled_user = User.objects.create_user(username='filled_user', email='filled@example.com')
        self.submitted_user = User.objects.create_user(username='submitted_user', email='submitted@example.com')

        joined_at = timezone.make_aware(datetime(2026, 1, 1, 9, 0, 0))
        User.objects.filter(
            id__in=[self.missing_user.id, self.filled_user.id, self.submitted_user.id]
        ).update(date_joined=joined_at)
        UserProfile.objects.create(user=self.missing_user, role=self.employee_role)
        UserProfile.objects.create(user=self.filled_user, role=self.employee_role)
        UserProfile.objects.create(user=self.submitted_user, role=self.employee_role)

        self.project = Project.objects.create(code='reminder-pr1', quotation_id=901, description='Reminder project')
        self.milestone = Milestone.objects.create(project=self.project, name='Reminder milestone')
        self.task = Task.objects.create(project=self.project, name='Reminder task', milestone=self.milestone)
        self.assigned_task = AssignedTask.objects.create(
            assign_by=self.manager,
            assign_to=self.filled_user,
            project_obj=self.project,
            task_obj=self.task,
            milestone_obj=self.milestone,
        )

    @patch('api.services.timesheet_reminders.send_mail')
    def test_daily_reminder_sends_to_users_missing_previous_day_timesheet(self, mock_send_mail):
        Submission.objects.create(
            assignId=self.assigned_task,
            date=date(2026, 9, 8),
            hours=3600,
        )

        reminded_users = send_daily_timesheet_reminders(today=date(2026, 9, 9))

        self.assertEqual([user.email for user in reminded_users], ['missing@example.com', 'submitted@example.com'])
        self.assertEqual(mock_send_mail.call_count, 2)
        self.assertEqual(mock_send_mail.call_args_list[0].args[2], ['missing@example.com'])
        self.assertIn('08-09-2026', mock_send_mail.call_args_list[0].args[0])
        self.assertIn('08-09-2026', mock_send_mail.call_args_list[0].args[1])

    @patch('api.services.timesheet_reminders.send_mail')
    def test_daily_reminder_skips_days_outside_tuesday_to_friday(self, mock_send_mail):
        reminded_users = send_daily_timesheet_reminders(today=date(2026, 9, 14))

        self.assertEqual(reminded_users, [])
        mock_send_mail.assert_not_called()

    @patch('api.services.timesheet_reminders.send_mail')
    def test_weekly_reminder_sends_to_users_without_current_week_submission(self, mock_send_mail):
        TimesheetWeekLog.objects.create(
            uid=self.submitted_user,
            timesheet_status='Submitted',
            submission_status=True,
            weeknumber=37,
            weekyear=2026,
        )

        reminded_users = send_weekly_timesheet_submission_reminders(today=date(2026, 9, 11))

        self.assertEqual([user.email for user in reminded_users], ['filled@example.com', 'missing@example.com'])
        self.assertEqual(mock_send_mail.call_count, 2)
        self.assertIn('Week 37', mock_send_mail.call_args_list[0].args[0])
        self.assertIn('07-09-2026 to 13-09-2026', mock_send_mail.call_args_list[0].args[1])

    @patch('api.services.timesheet_reminders.send_mail')
    def test_reminders_exclude_configured_roles(self, mock_send_mail):
        ceo = User.objects.create_user(username='ceo_user', email='ceo@example.com')
        ceo.date_joined = timezone.make_aware(datetime(2026, 1, 1, 9, 0, 0))
        ceo.save(update_fields=['date_joined'])
        UserProfile.objects.create(user=ceo, role=self.ceo_role)

        with self.settings(TIMESHEET_EXCLUDED_ROLE_NAMES=['CEO']):
            daily_users = send_daily_timesheet_reminders(today=date(2026, 9, 9))
            weekly_users = send_weekly_timesheet_submission_reminders(today=date(2026, 9, 11))

        self.assertNotIn('ceo@example.com', [user.email for user in daily_users])
        self.assertNotIn('ceo@example.com', [user.email for user in weekly_users])


class TimesheetEntryAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='timesheet_user', email='timesheet@example.com', password='Pass123!')
        self.manager = User.objects.create_user(username='manager_user', email='manager@example.com', password='Pass123!')
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(code='pr1', quotation_id=1, description='Q-001')
        self.milestone = Milestone.objects.create(project=self.project, name='mile1')
        self.task = Task.objects.create(project=self.project, name='task1', milestone=self.milestone)
        self.assigned_task = AssignedTask.objects.create(
            assign_by=self.manager,
            assign_to=self.user,
            project_obj=self.project,
            task_obj=self.task,
            milestone_obj=self.milestone,
        )
        Submission.objects.create(assignId=self.assigned_task, date=date(2026, 8, 3), hours=14400)
        Submission.objects.create(assignId=self.assigned_task, date=date(2026, 8, 4), hours=18000)

    def test_timesheet_entries_endpoint_returns_nested_project_data(self):
        response = self.client.get('/api/timesheet-entries/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['code'], 'pr1')
        self.assertEqual(response.data[0]['milestones'][0]['name'], 'mile1')
        self.assertEqual(response.data[0]['milestones'][0]['assigned_tasks'][0]['assign_id'], self.assigned_task.id)
        self.assertEqual(response.data[0]['milestones'][0]['assigned_tasks'][0]['name'], 'task1')
        self.assertEqual(response.data[0]['milestones'][0]['assigned_tasks'][0]['entries']['2026-08-03'], '4.00')
        self.assertEqual(response.data[0]['milestones'][0]['assigned_tasks'][0]['entries']['2026-08-04'], '5.00')

    def test_timesheet_entries_endpoint_always_includes_others_project(self):
        other_user = User.objects.create_user(username='other_user', email='other@example.com', password='Pass123!')
        self.client.force_authenticate(user=other_user)

        others_project = Project.objects.create(code='Others', description='Non project activities')
        others_milestone = Milestone.objects.create(project=others_project, name='General')
        Task.objects.create(project=others_project, name='Leave', milestone=others_milestone)

        response = self.client.get('/api/timesheet-entries/?week_start=2026-08-03')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['code'], 'Others')
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
                        'hours': 28800,
                    },
                    {
                        'assignId': self.assigned_task.id,
                        'date': '2026-08-05',
                        'hours': 25200,
                    },
                    {
                        'assignId': self.assigned_task.id,
                        'date': '2026-08-06',
                        'hours': 46800,
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
                hours=28800,
                status='Submitted',
                approvedBy=self.manager,
            ).exists()
        )
        self.assertTrue(
            TimesheetWeekLog.objects.filter(
                uid=self.user,
                timesheet_status='Submitted',
                weeknumber=32,
                weekyear=2026,
                comments='Ready for approval',
                submission_status=True,
            ).exists()
        )

    def test_resubmit_preserves_only_unchanged_accepted_entries(self):
        second_task = Task.objects.create(
            project=self.project,
            name='task2',
            milestone=self.milestone,
        )
        third_task = Task.objects.create(
            project=self.project,
            name='task3',
            milestone=self.milestone,
        )
        fourth_task = Task.objects.create(
            project=self.project,
            name='task4',
            milestone=self.milestone,
        )
        second_assigned_task = AssignedTask.objects.create(
            assign_by=self.manager,
            assign_to=self.user,
            project_obj=self.project,
            task_obj=second_task,
            milestone_obj=self.milestone,
        )
        third_assigned_task = AssignedTask.objects.create(
            assign_by=self.manager,
            assign_to=self.user,
            project_obj=self.project,
            task_obj=third_task,
            milestone_obj=self.milestone,
        )
        fourth_assigned_task = AssignedTask.objects.create(
            assign_by=self.manager,
            assign_to=self.user,
            project_obj=self.project,
            task_obj=fourth_task,
            milestone_obj=self.milestone,
        )

        Submission.objects.filter(assignId=self.assigned_task).delete()
        accepted_unchanged = Submission.objects.create(
            assignId=self.assigned_task,
            date=date(2026, 8, 3),
            hours=48600,
            rate=5,
            status='Accepted',
            approvedBy=self.manager,
            approved_status=True,
        )
        accepted_changed = Submission.objects.create(
            assignId=second_assigned_task,
            date=date(2026, 8, 4),
            hours=36000,
            rate=4,
            status='Accepted',
            approvedBy=self.manager,
            approved_status=True,
        )
        rejected_entry = Submission.objects.create(
            assignId=third_assigned_task,
            date=date(2026, 8, 5),
            hours=48600,
            rate=0,
            status='Rejected',
            approvedBy=self.manager,
            approved_status=False,
            rejection_reason='Need correction',
        )

        response = self.client.post(
            '/api/timesheet-entries/submit/',
            {
                'week_start': '2026-08-03',
                'entries': [
                    {
                        'assignId': self.assigned_task.id,
                        'date': '2026-08-03',
                        'hours': 48600,
                    },
                    {
                        'assignId': second_assigned_task.id,
                        'date': '2026-08-04',
                        'hours': 46800,
                    },
                    {
                        'assignId': third_assigned_task.id,
                        'date': '2026-08-05',
                        'hours': 48600,
                    },
                    {
                        'assignId': fourth_assigned_task.id,
                        'date': '2026-08-06',
                        'hours': 50400,
                    },
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        accepted_unchanged.refresh_from_db()
        accepted_changed.refresh_from_db()
        rejected_entry.refresh_from_db()
        new_entry = Submission.objects.get(
            assignId=fourth_assigned_task,
            date=date(2026, 8, 6),
        )

        self.assertEqual(accepted_unchanged.status, 'Accepted')
        self.assertTrue(accepted_unchanged.approved_status)
        self.assertEqual(accepted_unchanged.rate, 5)

        self.assertEqual(accepted_changed.status, 'Submitted')
        self.assertFalse(accepted_changed.approved_status)
        self.assertEqual(accepted_changed.hours, 46800)

        self.assertEqual(rejected_entry.status, 'Submitted')
        self.assertIsNone(rejected_entry.rejection_reason)

        self.assertEqual(new_entry.status, 'Submitted')
        self.assertFalse(new_entry.approved_status)
        timesheet_status = TimesheetWeekLog.objects.get(
            uid=self.user,
            weeknumber=32,
            weekyear=2026,
        )
        self.assertEqual(timesheet_status.timesheet_status, 'Submitted')
        self.assertFalse(timesheet_status.action_status)

    def test_sync_timesheet_status_uses_submission_status_precedence(self):
        TimesheetWeekLog.objects.create(
            uid=self.user,
            timesheet_status='Submitted',
            weeknumber=32,
            weekyear=2026,
            submission_status=True,
        )
        Submission.objects.filter(assignId=self.assigned_task).delete()
        Submission.objects.create(
            assignId=self.assigned_task,
            date=date(2026, 8, 3),
            hours=28800,
            status='Accepted',
            approved_status=True,
        )
        Submission.objects.create(
            assignId=self.assigned_task,
            date=date(2026, 8, 4),
            hours=18000,
            status='Rejected',
            approved_status=False,
        )

        _sync_timesheet_status(self.user, date(2026, 8, 3))
        timesheet_status = TimesheetWeekLog.objects.get(uid=self.user, weeknumber=32, weekyear=2026)
        self.assertEqual(timesheet_status.timesheet_status, 'Rejected')

        Submission.objects.filter(status='Rejected').update(
            status='Submitted',
            approved_status=False,
        )
        _sync_timesheet_status(self.user, date(2026, 8, 3))
        timesheet_status.refresh_from_db()
        self.assertEqual(timesheet_status.timesheet_status, 'Submitted')

        Submission.objects.all().update(
            status='Accepted',
            approved_status=True,
        )
        _sync_timesheet_status(self.user, date(2026, 8, 3))
        timesheet_status.refresh_from_db()
        self.assertEqual(timesheet_status.timesheet_status, 'Accepted')

    def test_submit_endpoint_rejects_daily_total_above_fourteen_hours(self):
        second_task = Task.objects.create(
            project=self.project,
            name='task2',
            milestone=self.milestone,
        )
        second_assigned_task = AssignedTask.objects.create(
            assign_by=self.manager,
            assign_to=self.user,
            project_obj=self.project,
            task_obj=second_task,
            milestone_obj=self.milestone,
        )

        response = self.client.post(
            '/api/timesheet-entries/submit/',
            {
                'week_start': '2026-08-03',
                'entries': [
                    {
                        'assignId': self.assigned_task.id,
                        'date': '2026-08-05',
                        'hours': 50400,
                    },
                    {
                        'assignId': second_assigned_task.id,
                        'date': '2026-08-05',
                        'hours': 25260,
                    },
                    {
                        'assignId': self.assigned_task.id,
                        'date': '2026-08-06',
                        'hours': 50400,
                    },
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            Submission.objects.filter(
                assignId=second_assigned_task,
                date=date(2026, 8, 5),
            ).exists()
        )

    def test_submit_endpoint_rejects_week_total_below_estimated_hours(self):
        response = self.client.post(
            '/api/timesheet-entries/submit/',
            {
                'week_start': '2026-08-03',
                'entries': [
                    {
                        'assignId': self.assigned_task.id,
                        'date': '2026-08-05',
                        'hours': 1800,
                    },
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            Submission.objects.filter(assignId=self.assigned_task, date=date(2026, 8, 5)).exists()
        )

    def test_save_draft_accepts_seconds_for_minutes(self):
        response = self.client.post(
            '/api/timesheet-entries/save-draft/',
            {
                'entries': [
                    {
                        'assignId': self.assigned_task.id,
                        'date': '2026-08-05',
                        'hours': 1800,
                    },
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            Submission.objects.filter(
                assignId=self.assigned_task,
                date=date(2026, 8, 5),
                hours=1800,
                status='Draft',
            ).exists()
        )

    def test_save_draft_requires_budget_owner_for_positive_hours(self):
        self.assigned_task.assign_by = None
        self.assigned_task.save(update_fields=['assign_by'])

        response = self.client.post(
            '/api/timesheet-entries/save-draft/',
            {
                'entries': [
                    {
                        'assignId': self.assigned_task.id,
                        'date': '2026-08-03',
                        'hours': 8,
                    },
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Budget owner is required', str(response.data))

    def test_current_timesheet_status_endpoint_returns_week_status(self):
        TimesheetWeekLog.objects.create(
            uid=self.user,
            timesheet_status='Submitted',
            weeknumber=32,
            weekyear=2026,
            submission_status=True,
            comments='Already submitted',
        )

        response = self.client.get('/api/timesheet-week-logs/current/?week_start=2026-08-03')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['timesheet_status'], 'Submitted')
        self.assertEqual(response.data['weeknumber'], 32)
        self.assertEqual(response.data['weekyear'], 2026)
        self.assertEqual(response.data['comments'], 'Already submitted')

    def test_timesheet_status_logs_returns_employee_week_data(self):
        TimesheetWeekLog.objects.create(
            uid=self.user,
            timesheet_status='Submitted',
            weeknumber=32,
            weekyear=2026,
            submission_status=True,
        )

        response = self.client.get(
            f'/api/timesheet-week-logs/logs/?employee_id={self.user.id}&week=32&year=2026'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['week_columns'][0]['key'], '2026-W32')
        self.assertEqual(len(response.data['results']), 1)

        employee_row = response.data['results'][0]
        week_data = employee_row['weeks']['2026-W32']

        self.assertEqual(employee_row['employee_id'], self.user.id)
        self.assertEqual(week_data['weeknumber'], 32)
        self.assertEqual(week_data['weekyear'], 2026)
        self.assertEqual(week_data['timesheet_status'], 'Submitted')
        self.assertEqual(week_data['submission_timing'], 'OnTime')
        self.assertEqual(week_data['total_hours'], 9.0)

    def test_timesheet_status_logs_includes_not_submitted_weeks(self):
        response = self.client.get(
            f'/api/timesheet-week-logs/logs/?employee_id={self.user.id}&week=33&year=2026'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

        week_data = response.data['results'][0]['weeks']['2026-W33']
        self.assertEqual(week_data['timesheet_status'], 'Not Submitted')
        self.assertEqual(week_data['submission_timing'], 'Not Submitted')
        self.assertFalse(week_data['submission_status'])
        self.assertIsNone(week_data['submitted_at'])

    def test_timesheet_status_logs_exclude_configured_roles(self):
        ceo_role = Role.objects.create(name='CEO')
        UserProfile.objects.create(user=self.user, role=ceo_role)

        with self.settings(TIMESHEET_EXCLUDED_ROLE_NAMES=['CEO']):
            response = self.client.get(
                f'/api/timesheet-week-logs/logs/?employee_id={self.user.id}&week=33&year=2026'
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'], [])

    def test_timesheet_status_logs_marks_unlocked_or_requested_as_not_submitted(self):
        for status_label in ['Unlocked', 'Requested']:
            with self.subTest(status_label=status_label):
                TimesheetWeekLog.objects.filter(uid=self.user, weeknumber=33, weekyear=2026).delete()
                TimesheetWeekLog.objects.create(
                    uid=self.user,
                    timesheet_status=status_label,
                    weeknumber=33,
                    weekyear=2026,
                    submission_status=False,
                )

                response = self.client.get(
                    f'/api/timesheet-week-logs/logs/?employee_id={self.user.id}&week=33&year=2026'
                )

                self.assertEqual(response.status_code, status.HTTP_200_OK)
                week_data = response.data['results'][0]['weeks']['2026-W33']
                self.assertEqual(week_data['timesheet_status'], status_label)
                self.assertEqual(week_data['submission_timing'], 'Not Submitted')
                self.assertFalse(week_data['submission_status'])

    def test_timesheet_status_logs_marks_unsubmitted_final_status_as_delayed(self):
        TimesheetWeekLog.objects.create(
            uid=self.user,
            timesheet_status='Submitted',
            weeknumber=33,
            weekyear=2026,
            submission_status=False,
        )

        response = self.client.get(
            f'/api/timesheet-week-logs/logs/?employee_id={self.user.id}&week=33&year=2026'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        week_data = response.data['results'][0]['weeks']['2026-W33']
        self.assertEqual(week_data['timesheet_status'], 'Submitted')
        self.assertEqual(week_data['submission_timing'], 'Delayed')
        self.assertFalse(week_data['submission_status'])

    def test_timesheet_status_logs_marks_pre_joining_weeks_as_not_applicable(self):
        self.user.date_joined = timezone.make_aware(datetime(2026, 8, 20, 9, 0))
        self.user.save(update_fields=['date_joined'])

        response = self.client.get(
            f'/api/timesheet-week-logs/logs/?employee_id={self.user.id}&week=33&year=2026'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        week_data = response.data['results'][0]['weeks']['2026-W33']
        self.assertEqual(week_data['timesheet_status'], 'Not Applicable')
        self.assertEqual(week_data['submission_timing'], 'Not Applicable')
        self.assertFalse(week_data['submission_status'])
        self.assertIsNone(week_data['submitted_at'])

    def test_timesheet_status_logs_defaults_to_last_four_weeks(self):
        response = self.client.get(f'/api/timesheet-week-logs/logs/?employee_id={self.user.id}')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(response.data['week_columns']), 4)
        self.assertEqual(len(response.data['results']), 1)

    def test_timesheet_reviewer_logs_marks_not_submitted_as_not_applicable(self):
        response = self.client.get(
            f'/api/timesheet-week-logs/reviewer-logs/?employee_id={self.user.id}&week=33&year=2026'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        week_data = response.data['results'][0]['weeks']['2026-W33']
        self.assertEqual(week_data['review_status'], 'N/A')
        self.assertFalse(week_data['submitted'])
        self.assertEqual(week_data['approvers'], [])

    def test_timesheet_reviewer_logs_returns_partial_approver_details(self):
        second_manager = User.objects.create_user(
            username='second_manager',
            email='second-manager@example.com',
            password='Pass123!',
        )
        second_task = Task.objects.create(
            project=self.project,
            name='task2',
            milestone=self.milestone,
        )
        second_assigned_task = AssignedTask.objects.create(
            assign_by=second_manager,
            assign_to=self.user,
            project_obj=self.project,
            task_obj=second_task,
            milestone_obj=self.milestone,
        )
        TimesheetWeekLog.objects.create(
            uid=self.user,
            timesheet_status='Submitted',
            weeknumber=32,
            weekyear=2026,
            submission_status=True,
        )
        Submission.objects.create(
            assignId=self.assigned_task,
            date=date(2026, 8, 5),
            hours=28800,
            status='Accepted',
        )
        Submission.objects.create(
            assignId=second_assigned_task,
            date=date(2026, 8, 5),
            hours=28800,
            status='Submitted',
        )

        response = self.client.get(
            f'/api/timesheet-week-logs/reviewer-logs/?employee_id={self.user.id}&week=32&year=2026'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        week_data = response.data['results'][0]['weeks']['2026-W32']
        self.assertEqual(week_data['review_status'], 'Partially Approved')
        self.assertEqual(week_data['total_approvers'], 2)
        self.assertEqual(week_data['completed_approvers'], 1)
        self.assertEqual(week_data['pending_approvers'], 1)
        self.assertEqual(
            {approver['status'] for approver in week_data['approvers']},
            {'Accepted', 'Pending'},
        )

    def test_timesheet_reviewer_logs_marks_all_accepted_as_ontime(self):
        TimesheetWeekLog.objects.create(
            uid=self.user,
            timesheet_status='Submitted',
            weeknumber=32,
            weekyear=2026,
            submission_status=True,
        )
        Submission.objects.create(
            assignId=self.assigned_task,
            date=date(2026, 8, 5),
            hours=28800,
            status='Accepted',
        )

        response = self.client.get(
            f'/api/timesheet-week-logs/reviewer-logs/?employee_id={self.user.id}&week=32&year=2026'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        week_data = response.data['results'][0]['weeks']['2026-W32']
        self.assertEqual(week_data['review_status'], 'OnTime')
        self.assertEqual(week_data['completed_approvers'], 1)
        self.assertEqual(week_data['pending_approvers'], 0)

    def test_request_unlock_creates_weekly_requested_status(self):
        response = self.client.post(
            '/api/timesheet-week-logs/request-unlock/',
            {
                'week_start': '2026-08-03',
                'unlock_reason': 'Missed Friday entry',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            TimesheetWeekLog.objects.filter(
                uid=self.user,
                timesheet_status='Requested',
                weeknumber=32,
                weekyear=2026,
                unlock_reason='Missed Friday entry',
            ).exists()
        )

    def test_request_unlock_rejects_submitted_week(self):
        TimesheetWeekLog.objects.create(
            uid=self.user,
            timesheet_status='Submitted',
            weeknumber=32,
            weekyear=2026,
            submission_status=True,
        )

        response = self.client.post(
            '/api/timesheet-week-logs/request-unlock/',
            {
                'week_start': '2026-08-03',
                'unlock_reason': 'Need update',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ticket_options_excludes_open_and_closed_tickets(self):
        department = Group.objects.create(name='Support')
        Ticket.objects.create(
            creator=self.user,
            assigned_to=self.user,
            task='Accepted ticket task',
            description='Accepted ticket description',
            department=department,
            current_status='accepted',
        )
        Ticket.objects.create(
            creator=self.user,
            assigned_to=self.user,
            task='Open ticket task',
            description='Open ticket description',
            department=department,
            current_status='open',
        )
        Ticket.objects.create(
            creator=self.user,
            assigned_to=self.user,
            task='Closed ticket task',
            description='Closed ticket description',
            department=department,
            current_status='closed',
        )

        response = self.client.get('/api/timesheet-entries/ticket-options/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['task'], 'Accepted ticket task')

    def test_assign_tickets_creates_project_and_user_assignment_without_task(self):
        department = Group.objects.create(name='Support')
        ticket = Ticket.objects.create(
            creator=self.user,
            assigned_to=self.user,
            task='Ticket implementation',
            description='Ticket details',
            department=department,
            current_status='accepted',
        )

        response = self.client.post(
            '/api/timesheet-entries/assign-tickets/',
            {'ticket_ids': [ticket.id]},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project = Project.objects.get(code=ticket.number)
        self.assertEqual(project.description, 'Ticket implementation')
        self.assertTrue(
            AssignedTask.objects.filter(
                assign_to=self.user,
                project_obj=project,
                task_obj__isnull=True,
                milestone_obj__isnull=True,
            ).exists()
        )

        entries_response = self.client.get('/api/timesheet-entries/?week_start=2026-08-03')
        ticket_project = next(
            project_data for project_data in entries_response.data if project_data['code'] == ticket.number
        )
        self.assertEqual(ticket_project['milestones'][0]['name'], 'General')
        self.assertEqual(ticket_project['milestones'][0]['assigned_tasks'][0]['name'], 'Ticket implementation')

    def test_approval_action_allows_others_project_without_rating(self):
        others_project = Project.objects.create(code='Others', description='Non project activities')
        others_milestone = Milestone.objects.create(project=others_project, name='General')
        others_task = Task.objects.create(project=others_project, name='Leave', milestone=others_milestone)
        others_assigned_task = AssignedTask.objects.create(
            assign_by=self.manager,
            assign_to=self.user,
            project_obj=others_project,
            task_obj=others_task,
            milestone_obj=others_milestone,
        )
        Submission.objects.create(
            assignId=others_assigned_task,
            date=date(2026, 8, 3),
            hours=28800,
            status='Submitted',
        )
        self.client.force_authenticate(user=self.manager)

        response = self.client.patch(
            '/api/ApprovalDetailData/',
            {
                'weekStart': '2026-08-03',
                'employeeId': self.user.id,
                'assignId': others_assigned_task.id,
                'action': 'Rejected',
                'rating': 0,
                'comments': 'Leave is not approved for this week.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            Submission.objects.filter(
                assignId=others_assigned_task,
                status='Rejected',
                rate=0,
                rejection_reason='Leave is not approved for this week.',
            ).exists()
        )
