from datetime import date, timedelta
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from tickets.models import Self_Ticket, SelfTicketOccurrence
from tickets.services.self_ticket_schedule import ensure_occurrences, occurrence_dates
from tickets.services.self_ticket_reminders import send_self_ticket_reminders

User = get_user_model()


class DoListSchedulingTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='schedule-owner', email='owner@example.com', is_staff=True)
        self.client = APIClient()
        self.client.force_authenticate(self.owner)

    def task(self, **kwargs):
        return Self_Ticket.objects.create(creator=self.owner, task='Scheduled task', **kwargs)

    def test_legacy_defaults_preserved(self):
        task = self.task()
        self.assertEqual(task.schedule_type, 'static')
        self.assertEqual(task.reminder_mode, 'legacy')
        self.assertEqual(task.reminder_interval, 1)
        self.assertFalse(task.occurrences.exists())

    def test_monthly_anchor_returns_to_original_day(self):
        task = self.task(schedule_type='recurring', target_date=date(2028, 1, 31))
        self.assertEqual(list(occurrence_dates(task, date(2028, 4, 30))), [
            date(2028, 1, 31), date(2028, 2, 29), date(2028, 3, 31), date(2028, 4, 30),
        ])

    def test_yearly_leap_day_and_interval(self):
        task = self.task(schedule_type='recurring', target_date=date(2024, 2, 29), repeat_frequency='yearly')
        self.assertEqual(list(occurrence_dates(task, date(2028, 2, 29)))[-1], date(2028, 2, 29))
        task.repeat_frequency = 'weekly'
        task.repeat_interval = 2
        self.assertEqual(list(occurrence_dates(task, date(2024, 3, 28))), [date(2024, 2, 29), date(2024, 3, 14), date(2024, 3, 28)])

    def test_period_validation_and_single_completion(self):
        payload = {'task': 'Period', 'description': 'Monitor', 'schedule_type': 'period',
                   'target_date': '2028-02-10', 'start_date': '2028-02-11'}
        self.assertEqual(self.client.post('/api/self-tickets/', payload).status_code, 400)
        payload['start_date'] = '2028-02-01'
        response = self.client.post('/api/self-tickets/', payload)
        self.assertEqual(response.status_code, 201, response.data)
        task = Self_Ticket.objects.get(pk=response.data['id'])
        self.assertEqual(task.reminder_mode, 'before_due')
        response = self.client.patch(f'/api/self-tickets/{task.pk}/', {'current_status': 'closed'})
        self.assertEqual(response.status_code, 200, response.data)
        task.refresh_from_db()
        self.assertEqual(task.current_status, 'closed')
        self.assertFalse(task.occurrences.exists())

    def test_recurrence_creation_and_separate_completion(self):
        today = timezone.localdate()
        response = self.client.post('/api/self-tickets/', {
            'task': 'Inspection', 'description': 'Check', 'schedule_type': 'recurring',
            'target_date': str(today), 'repeat_frequency': 'daily',
            'repeat_until': str(today + timedelta(days=2)),
        })
        self.assertEqual(response.status_code, 201, response.data)
        task = Self_Ticket.objects.get(pk=response.data['id'])
        self.assertEqual(task.occurrences.count(), 3)
        first = task.occurrences.first()
        response = self.client.post(f'/api/self-tickets/{task.pk}/occurrence-status/', {
            'occurrence_id': first.pk, 'current_status': 'closed',
        })
        self.assertEqual(response.status_code, 200, response.data)
        task.refresh_from_db()
        self.assertEqual(task.current_status, 'open')
        self.assertEqual(task.occurrences.filter(current_status='open').count(), 2)
        self.assertEqual(task.selfLogs.get().occurrence_id, first.pk)
        self.assertEqual(self.client.patch(f'/api/self-tickets/{task.pk}/', {'current_status': 'closed'}).status_code, 400)
        ensure_occurrences(task)
        self.assertEqual(task.occurrences.count(), 3)

    def test_invalid_schedule_inputs(self):
        for fields in [{'repeat_interval': 0}, {'reminder_days_before': 0}, {'repeat_until': '2028-01-01'}]:
            response = self.client.post('/api/self-tickets/', {
                'task': 'Invalid', 'description': 'Check', 'schedule_type': 'recurring',
                'target_date': '2028-02-01', **fields,
            })
            self.assertEqual(response.status_code, 400, response.data)

    @patch('tickets.services.self_ticket_reminders.send_mail')
    def test_before_due_reminders_once_and_no_due_day_email(self, mail):
        today = timezone.localdate()
        task = self.task(reminder_mode='before_due', reminder_days_before=2, target_date=today + timedelta(days=2))
        self.assertEqual(len(send_self_ticket_reminders(today)), 1)
        send_self_ticket_reminders(today)
        send_self_ticket_reminders(today + timedelta(days=2))
        self.assertEqual(mail.call_count, 1)
        task.refresh_from_db()
        self.assertTrue(task.alarm)
        task.current_status = 'closed'
        task.save()
        send_self_ticket_reminders(today)
        self.assertEqual(mail.call_count, 1)

    @patch('tickets.services.self_ticket_reminders.send_mail')
    def test_recurring_reminders_skip_closed_and_paused(self, mail):
        today = timezone.localdate()
        task = self.task(schedule_type='recurring', repeat_frequency='daily', repeat_until=today + timedelta(days=3),
                         target_date=today, reminder_mode='before_due', reminder_days_before=1)
        ensure_occurrences(task)
        task.occurrences.filter(scheduled_date=today + timedelta(days=1)).update(current_status='closed')
        send_self_ticket_reminders(today)
        self.assertFalse(mail.called)
        send_self_ticket_reminders(today + timedelta(days=1))
        self.assertEqual(mail.call_count, 1)
        task.is_active = False
        task.save()
        send_self_ticket_reminders(today + timedelta(days=2))
        self.assertEqual(mail.call_count, 1)

    def test_other_owner_cannot_complete_occurrence(self):
        other = User.objects.create_user(username='other-owner')
        task = Self_Ticket.objects.create(creator=other, task='Other', schedule_type='recurring')
        occurrence = SelfTicketOccurrence.objects.create(self_ticket=task, scheduled_date=timezone.localdate())
        response = self.client.post(f'/api/self-tickets/{task.pk}/occurrence-status/', {
            'occurrence_id': occurrence.pk, 'current_status': 'closed',
        })
        self.assertEqual(response.status_code, 404)
        occurrence.refresh_from_db()
        self.assertEqual(occurrence.current_status, 'open')

    def test_schedule_edit_preserves_completed_and_overdue_occurrences(self):
        today = timezone.localdate()
        task = self.task(schedule_type='recurring', target_date=today - timedelta(days=1),
                         repeat_frequency='daily', repeat_until=today + timedelta(days=3))
        ensure_occurrences(task)
        completed = task.occurrences.get(scheduled_date=today)
        completed.current_status = 'closed'
        completed.save()
        response = self.client.patch(f'/api/self-tickets/{task.pk}/', {
            'repeat_frequency': 'weekly', 'repeat_until': str(today + timedelta(days=14)),
        })
        self.assertEqual(response.status_code, 200, response.data)
        task.refresh_from_db()
        self.assertTrue(task.occurrences.filter(pk=completed.pk, current_status='closed').exists())
        self.assertTrue(task.occurrences.filter(scheduled_date=today - timedelta(days=1)).exists())
        self.assertFalse(task.occurrences.filter(scheduled_date=today + timedelta(days=1)).exists())
        self.assertEqual(len(response.data['occurrences']), task.occurrences.count())

    def test_regular_owner_with_change_permission_can_complete(self):
        from django.contrib.auth.models import Permission
        from users.models import Role, UserProfile
        role = Role.objects.create(name='Schedule editor')
        role.permissions.add(*Permission.objects.filter(
            content_type__app_label='tickets', codename__in=['view_self_ticket', 'change_self_ticket'],
        ))
        self.owner.is_staff = False
        self.owner.save()
        UserProfile.objects.create(user=self.owner, role=role)
        self.client.force_authenticate(User.objects.get(pk=self.owner.pk))
        task = self.task(schedule_type='recurring')
        occurrence = SelfTicketOccurrence.objects.create(self_ticket=task, scheduled_date=timezone.localdate())
        response = self.client.post(f'/api/self-tickets/{task.pk}/occurrence-status/', {
            'occurrence_id': occurrence.pk, 'current_status': 'closed',
        })
        self.assertEqual(response.status_code, 200, response.data)

    def test_selected_reminder_mode_is_saved_for_all_schedule_types(self):
        today = timezone.localdate()
        for kind in ['static', 'period', 'recurring']:
            with self.subTest(kind=kind):
                response = self.client.post('/api/self-tickets/', {
                    'task': 'Reminder choice', 'description': 'Check mode',
                    'schedule_type': kind, 'start_date': str(today),
                    'target_date': str(today + timedelta(days=1)),
                    'repeat_until': str(today + timedelta(days=2)),
                    'reminder_mode': 'legacy', 'reminder_interval': 7,
                })
                self.assertEqual(response.status_code, 201, response.data)
                self.assertEqual(response.data['reminder_mode'], 'legacy')
                url = f"/api/self-tickets/{response.data['id']}/"
                response = self.client.patch(url, {'reminder_mode': 'before_due', 'reminder_days_before': 1})
                self.assertEqual(response.status_code, 200, response.data)
                self.assertEqual(response.data['reminder_mode'], 'before_due')
                response = self.client.patch(url, {'reminder_mode': 'legacy'})
                self.assertEqual(response.status_code, 200, response.data)
                self.assertEqual(response.data['reminder_mode'], 'legacy')

    def test_weekly_selected_days_and_two_week_interval(self):
        task = self.task(schedule_type='recurring', target_date=date(2028, 1, 5),
                         repeat_frequency='weekly', repeat_interval=2, repeat_weekdays=[0, 3])
        self.assertEqual(list(occurrence_dates(task, date(2028, 1, 20))), [
            date(2028, 1, 6), date(2028, 1, 17), date(2028, 1, 20),
        ])

    def test_monthly_first_last_and_specific_days(self):
        task = self.task(schedule_type='recurring', target_date=date(2028, 1, 15), monthly_day_mode='first')
        self.assertEqual(list(occurrence_dates(task, date(2028, 3, 1))), [date(2028, 2, 1), date(2028, 3, 1)])
        task.monthly_day_mode = 'last'
        self.assertEqual(list(occurrence_dates(task, date(2028, 3, 31))), [
            date(2028, 1, 31), date(2028, 2, 29), date(2028, 3, 31),
        ])
        task.monthly_day_mode = 'specific'
        task.repeat_day_of_month = 30
        self.assertEqual(list(occurrence_dates(task, date(2028, 3, 31))), [
            date(2028, 1, 30), date(2028, 2, 29), date(2028, 3, 30),
        ])
        task.repeat_day_of_month = 2
        task.repeat_interval = 2
        self.assertEqual(list(occurrence_dates(task, date(2028, 5, 2))), [date(2028, 3, 2), date(2028, 5, 2)])

    def test_invalid_weekdays_and_month_days(self):
        for fields in [{'repeat_weekdays': []}, {'repeat_weekdays': [7]},
                       {'repeat_weekdays': [-1]}, {'repeat_day_of_month': 0},
                       {'repeat_day_of_month': 32}, {'monthly_day_mode': 'invalid'}]:
            with self.subTest(fields=fields):
                response = self.client.post('/api/self-tickets/', {
                    'task': 'Invalid selection', 'description': 'Check validation',
                    'schedule_type': 'recurring', 'target_date': str(timezone.localdate()), **fields,
                }, format='json')
                self.assertEqual(response.status_code, 400, response.data)

    def test_weekday_and_monthly_rule_changes_regenerate_future_occurrences(self):
        today = timezone.localdate()
        task = self.task(schedule_type='recurring', target_date=today,
                         repeat_frequency='weekly', repeat_until=today + timedelta(days=60))
        ensure_occurrences(task)
        chosen_day = (today.weekday() + 1) % 7
        response = self.client.patch(f'/api/self-tickets/{task.pk}/', {
            'repeat_weekdays': [chosen_day],
        }, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        task.refresh_from_db()
        self.assertTrue(task.occurrences.exists())
        self.assertTrue(all(day.weekday() == chosen_day for day in task.occurrences.values_list('scheduled_date', flat=True)))
        response = self.client.patch(f'/api/self-tickets/{task.pk}/', {
            'repeat_frequency': 'monthly', 'monthly_day_mode': 'last',
        }, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        from calendar import monthrange
        self.assertTrue(all(day.day == monthrange(day.year, day.month)[1]
                            for day in task.occurrences.values_list('scheduled_date', flat=True)))
