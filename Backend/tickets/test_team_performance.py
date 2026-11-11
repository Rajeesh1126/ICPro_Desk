from datetime import date

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from rest_framework.test import APITestCase

from users.models import Role, UserProfile
from .models import Self_Ticket, SelfTicketOccurrence, Ticket

User = get_user_model()


class TeamPerformanceTests(APITestCase):
    url = '/api/team-performance/'
    params = {'start_date': '2026-11-02', 'end_date': '2026-11-08'}

    def setUp(self):
        role = Role.objects.create(name='Performance manager')
        role.permissions.add(Permission.objects.get(codename='access_team_analysis'))
        self.manager = User.objects.create_user(username='manager')
        UserProfile.objects.create(user=self.manager, role=role)
        self.employee = User.objects.create_user(username='alice', first_name='Alice', last_name='Jones')
        UserProfile.objects.create(user=self.employee, reporting_to=self.manager)
        self.idle = User.objects.create_user(username='idle')
        UserProfile.objects.create(user=self.idle, reporting_to=self.manager)
        self.other = User.objects.create_user(username='outsider')
        UserProfile.objects.create(user=self.other)
        self.indirect = User.objects.create_user(username='indirect')
        UserProfile.objects.create(user=self.indirect, reporting_to=self.employee)
        self.client.force_authenticate(self.manager)

    def ticket(self, owner=None, **kwargs):
        fields = dict(creator=self.other, assigned_to=owner or self.employee,
                      task='Internal task', description='Work', is_internal=True,
                      target_date=date(2026, 11, 4), current_status='open')
        fields.update(kwargs)
        return Ticket.objects.create(**fields)

    def task(self, owner=None, **kwargs):
        fields = dict(creator=owner or self.employee, task='Personal task', description='Work',
                      target_date=date(2026, 11, 4), current_status='open')
        fields.update(kwargs)
        return Self_Ticket.objects.create(**fields)

    def report(self, **params):
        return self.client.get(self.url, {**self.params, **params})

    def test_only_direct_reportees_internal_work_and_own_dolists_are_visible(self):
        expected_ticket = self.ticket()
        expected_task = self.task()
        self.ticket(self.other)
        self.ticket(self.indirect)
        self.ticket(self.manager)
        self.ticket(is_internal=False)
        self.ticket(target_date=date(2026, 11, 9))
        self.task(self.other)
        self.task(self.indirect)
        self.task(self.manager)
        self.task(target_date=date(2026, 11, 9))
        response = self.report(employee_id=self.other.id, include_executive='true')
        self.assertEqual(response.status_code, 200)
        self.assertEqual({row['id'] for row in response.data['employees']}, {self.employee.id, self.idle.id})
        self.assertEqual(response.data['total'], 2)
        self.assertEqual({item['number'] for item in response.data['work_items']},
                         {expected_ticket.number, expected_task.number})

    def test_completion_bars_and_status_totals_match_due_items(self):
        self.ticket(current_status='closed')
        self.ticket(current_status='in progress')
        self.task(current_status='closed')
        self.task()
        self.ticket(current_status='cancelled')
        self.task(current_status='cancelled')
        response = self.report()
        employee = next(row for row in response.data['employees'] if row['id'] == self.employee.id)
        for key in ['worklet', 'dolist']:
            self.assertEqual(employee[key], {'total': 2, 'completed': 1, 'progress': 50.0})
        self.assertEqual(employee['progress'], 50.0)
        self.assertEqual(sum(response.data['statuses'].values()), response.data['total'])
        self.assertEqual(response.data['total'], len(response.data['work_items']))
        idle = next(row for row in response.data['employees'] if row['id'] == self.idle.id)
        self.assertEqual(idle['progress'], 0)
        self.assertEqual(idle['count'], 0)

    def test_recurring_occurrences_use_their_own_status_and_missing_rows_are_read_only(self):
        task = self.task(schedule_type='recurring', repeat_frequency='daily',
                         target_date=date(2026, 11, 2), repeat_until=date(2026, 11, 8))
        SelfTicketOccurrence.objects.create(self_ticket=task, scheduled_date=date(2026, 11, 2), current_status='closed')
        SelfTicketOccurrence.objects.create(self_ticket=task, scheduled_date=date(2026, 11, 3), current_status='cancelled')
        response = self.report()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total'], 6)
        employee = next(row for row in response.data['employees'] if row['id'] == self.employee.id)
        self.assertEqual(employee['dolist']['completed'], 1)
        self.assertEqual(employee['dolist']['progress'], 16.7)
        self.assertEqual(SelfTicketOccurrence.objects.filter(self_ticket=task).count(), 2)
        self.assertEqual(len({item['id'] for item in response.data['work_items']}), 6)

    def test_periods_overlap_range_and_count_once(self):
        self.task(schedule_type='period', start_date=date(2026, 10, 20), target_date=date(2026, 11, 20))
        self.task(schedule_type='period', start_date=date(2026, 11, 9), target_date=date(2026, 11, 20))
        self.assertEqual(self.report().data['total'], 1)

    def test_inactive_recurring_tasks_and_inactive_employees_are_excluded(self):
        self.task(schedule_type='recurring', repeat_frequency='daily', is_active=False)
        self.employee.is_active = False
        self.employee.save()
        self.ticket()
        response = self.report()
        self.assertEqual(response.data['total'], 0)
        self.assertNotIn(self.employee.id, [item['id'] for item in response.data['employees']])

    def test_invalid_date_ranges_are_rejected(self):
        for params in [{'start_date': 'invalid'}, {'end_date': '2026-02-31'},
                       {'start_date': '2026-11-10', 'end_date': '2026-11-02'}]:
            self.assertEqual(self.report(**params).status_code, 400)

    def test_authentication_and_page_permission_are_enforced(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.report().status_code, 401)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.report().status_code, 403)

    def test_staff_cannot_expand_reporting_scope(self):
        self.manager.is_staff = True
        self.manager.save()
        self.ticket(self.other)
        self.task(self.other)
        self.assertEqual(self.report().data['total'], 0)

    def test_manager_without_reportees_gets_empty_report(self):
        self.other.is_staff = True
        self.other.save()
        self.client.force_authenticate(self.other)
        response = self.report()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['employees'], [])
        self.assertEqual(response.data['work_items'], [])
