from django.core.management.base import BaseCommand
from django.utils import timezone

from api.services.timesheet_reminders import (
    send_daily_timesheet_reminders,
    send_weekly_timesheet_submission_reminders,
)


class Command(BaseCommand):
    help = 'Send daily missing-timesheet and weekly submission reminder emails.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            choices=['daily', 'weekly', 'both'],
            default='both',
            help='Reminder type to send.',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Send reminders without weekday guard. Useful for manual runs and tests.',
        )

    def handle(self, *args, **options):
        today = timezone.localdate()
        reminder_type = options['type']
        force = options['force']

        daily_count = 0
        weekly_count = 0

        if reminder_type in {'daily', 'both'}:
            daily_count = len(send_daily_timesheet_reminders(today=today, force=force))

        if reminder_type in {'weekly', 'both'}:
            weekly_count = len(send_weekly_timesheet_submission_reminders(today=today, force=force))

        self.stdout.write(
            self.style.SUCCESS(
                'Timesheet reminder job completed. '
                f'{daily_count} daily reminder(s), {weekly_count} weekly reminder(s) sent.'
            )
        )
