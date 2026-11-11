from datetime import date

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from projects.models import AssignedTask, Milestone, Project, Task
from users.models import UserProfile
from .models import TimesheetWeekLog

User = get_user_model()


class ManagementTaskAssignmentTests(APITestCase):
    options_url = '/api/timesheet-entries/management-task-options/'
    assign_url = '/api/timesheet-entries/assign-management-tasks/'

    def setUp(self):
        self.user = User.objects.create_user(username='management_employee')
        self.manager = User.objects.create_user(username='management_manager')
        UserProfile.objects.create(user=self.user, reporting_to=self.manager)
        self.client.force_authenticate(self.user)
        self.project = Project.objects.create(code='ICP/GM/001', description='Management Jobs')
        self.milestone = Milestone.objects.create(project=self.project, name='Administration')
        self.task = Task.objects.create(project=self.project, milestone=self.milestone, name='Planning')
        self.general_task = Task.objects.create(project=self.project, name='Review')
        self.other_project = Project.objects.create(code='Other')
        self.other_task = Task.objects.create(project=self.other_project, name='Other work')

    def assign(self, ids=None, week='2026-11-02'):
        return self.client.post(self.assign_url, {
            'task_ids': ids if ids is not None else [self.task.id], 'week_start': week,
        }, format='json')

    def test_options_are_scoped_to_management_project_with_milestones(self):
        response = self.client.get(self.options_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['project']['code'], 'ICP/GM/001')
        tasks = {task['id']: task for task in response.data['tasks']}
        self.assertEqual(set(tasks), {self.task.id, self.general_task.id})
        self.assertEqual(tasks[self.task.id]['milestone_name'], 'Administration')
        self.assertEqual(tasks[self.general_task.id]['milestone_name'], 'General')

    def test_assigns_selected_tasks_to_current_user_and_selected_week(self):
        response = self.assign([self.task.id, self.general_task.id])
        self.assertEqual(response.status_code, 201)
        assignments = AssignedTask.objects.filter(assign_to=self.user)
        self.assertEqual(assignments.count(), 2)
        assignment = assignments.get(task_obj=self.task)
        self.assertEqual(assignment.assign_by, self.manager)
        self.assertEqual(assignment.milestone_obj, self.milestone)
        self.assertEqual(assignment.start_date, date(2026, 11, 2))
        self.assertEqual(assignment.end_date, date(2026, 11, 8))
        self.assertFalse(AssignedTask.objects.filter(assign_to=self.manager).exists())
        entries = self.client.get('/api/timesheet-entries/?week_start=2026-11-02')
        project = next(item for item in entries.data if item['code'] == 'ICP/GM/001')
        self.assertEqual({item['name'] for item in project['milestones']}, {'Administration', 'General'})

    def test_repeat_assignment_deduplicates_and_covers_another_week(self):
        self.assertEqual(self.assign([self.task.id, self.task.id]).status_code, 201)
        self.assertEqual(self.assign(week='2026-11-09').status_code, 201)
        assignment = AssignedTask.objects.get(assign_to=self.user, task_obj=self.task)
        self.assertEqual(assignment.start_date, date(2026, 11, 2))
        self.assertEqual(assignment.end_date, date(2026, 11, 15))

    def test_rejects_foreign_tasks_without_creating_partial_assignments(self):
        response = self.assign([self.task.id, self.other_task.id])
        self.assertEqual(response.status_code, 400)
        self.assertFalse(AssignedTask.objects.exists())

    def test_rejects_empty_selection_and_invalid_week(self):
        self.assertEqual(self.assign([]).status_code, 400)
        self.assertEqual(self.assign(week='2026-11-03').status_code, 400)
        self.assertEqual(self.assign(week='invalid').status_code, 400)
        self.assertEqual(self.client.post(self.assign_url, {'task_ids': [self.task.id]}, format='json').status_code, 400)
        self.assertFalse(AssignedTask.objects.exists())

    def test_locked_weeks_cannot_be_assigned_but_rejected_week_can(self):
        log = TimesheetWeekLog.objects.create(uid=self.user, weekyear=2026, weeknumber=45)
        for state in ['Submitted', 'Accepted', 'Requested']:
            log.timesheet_status = state
            log.save()
            self.assertEqual(self.assign().status_code, 400, state)
        self.assertFalse(AssignedTask.objects.exists())
        log.timesheet_status = 'Rejected'
        log.submission_status = True
        log.save()
        self.assertEqual(self.assign().status_code, 201)

    def test_missing_project_is_reported(self):
        self.project.delete()
        self.assertEqual(self.client.get(self.options_url).status_code, 404)

    def test_requires_authentication(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self.options_url).status_code, 401)
        self.assertEqual(self.assign().status_code, 401)

    def test_rejects_milestone_from_another_project(self):
        wrong_milestone = Milestone.objects.create(project=self.other_project, name='Wrong')
        self.task.milestone = wrong_milestone
        self.task.save()
        self.assertEqual(self.assign().status_code, 400)
        response = self.client.get(self.options_url)
        self.assertNotIn(self.task.id, [item['id'] for item in response.data['tasks']])
