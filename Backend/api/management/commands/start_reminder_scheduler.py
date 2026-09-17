import signal
import time

from apscheduler.events import EVENT_JOB_ERROR, EVENT_JOB_EXECUTED
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.services.timesheet_reminders import (
    send_daily_timesheet_reminders,
    send_weekly_timesheet_submission_reminders,
)
from tickets.services.self_ticket_reminders import send_self_ticket_reminders


def run_daily_timesheet_reminders():
    reminded_users = send_daily_timesheet_reminders(today=timezone.localdate())
    return f'{len(reminded_users)} daily timesheet reminder(s) sent.'


def run_weekly_timesheet_reminders():
    reminded_users = send_weekly_timesheet_submission_reminders(today=timezone.localdate())
    return f'{len(reminded_users)} weekly timesheet reminder(s) sent.'


def run_self_ticket_reminders():
    reminded_tickets = send_self_ticket_reminders(today=timezone.localdate())
    return f'{len(reminded_tickets)} self-ticket reminder(s) sent.'


class Command(BaseCommand):
    help = 'Start APScheduler for timesheet and self-ticket reminder emails.'

    def handle(self, *args, **options):
        scheduler_timezone = settings.REMINDER_SCHEDULER_TIME_ZONE
        daily_day_of_week = settings.TIMESHEET_DAILY_REMINDER_DAY_OF_WEEK
        daily_hour = settings.TIMESHEET_DAILY_REMINDER_HOUR
        daily_minute = settings.TIMESHEET_DAILY_REMINDER_MINUTE
        weekly_day_of_week = settings.TIMESHEET_WEEKLY_REMINDER_DAY_OF_WEEK
        weekly_hour = settings.TIMESHEET_WEEKLY_REMINDER_HOUR
        weekly_minute = settings.TIMESHEET_WEEKLY_REMINDER_MINUTE
        self_ticket_day_of_week = settings.SELF_TICKET_REMINDER_DAY_OF_WEEK
        self_ticket_hour = settings.SELF_TICKET_REMINDER_HOUR
        self_ticket_minute = settings.SELF_TICKET_REMINDER_MINUTE

        scheduler = BackgroundScheduler(timezone=scheduler_timezone)

        def log_job_event(event):
            if event.exception:
                self.stderr.write(
                    self.style.ERROR(
                        f'Reminder job failed: {event.job_id} - {event.exception}'
                    )
                )
                return

            self.stdout.write(
                self.style.SUCCESS(
                    f'Reminder job completed: {event.job_id} - {event.retval}'
                )
            )

        scheduler.add_listener(log_job_event, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)
        scheduler.add_job(
            run_daily_timesheet_reminders,
            CronTrigger(
                day_of_week=daily_day_of_week,
                hour=daily_hour,
                minute=daily_minute,
                timezone=scheduler_timezone,
            ),
            id='daily_timesheet_reminders',
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )
        scheduler.add_job(
            run_weekly_timesheet_reminders,
            CronTrigger(
                day_of_week=weekly_day_of_week,
                hour=weekly_hour,
                minute=weekly_minute,
                timezone=scheduler_timezone,
            ),
            id='weekly_timesheet_reminders',
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )
        scheduler.add_job(
            run_self_ticket_reminders,
            CronTrigger(
                day_of_week=self_ticket_day_of_week,
                hour=self_ticket_hour,
                minute=self_ticket_minute,
                timezone=scheduler_timezone,
            ),
            id='self_ticket_reminders',
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )

        should_stop = False

        def stop_scheduler(signum, frame):
            nonlocal should_stop
            should_stop = True

        signal.signal(signal.SIGINT, stop_scheduler)
        signal.signal(signal.SIGTERM, stop_scheduler)

        scheduler.start()
        self.stdout.write(self.style.SUCCESS('Reminder scheduler started.'))
        self.stdout.write(
            f'Daily timesheet reminders: {daily_day_of_week} at {daily_hour:02d}:{daily_minute:02d}.'
        )
        self.stdout.write(
            f'Weekly timesheet reminders: {weekly_day_of_week} at {weekly_hour:02d}:{weekly_minute:02d}.'
        )
        self.stdout.write(
            'Self-ticket reminders: '
            f'{self_ticket_day_of_week} at '
            f'{self_ticket_hour:02d}:'
            f'{self_ticket_minute:02d}.'
        )
        self.stdout.write(f'Scheduler timezone: {scheduler_timezone}.')
        for job in scheduler.get_jobs():
            self.stdout.write(f'Next run for {job.id}: {job.next_run_time}')

        try:
            while not should_stop:
                time.sleep(1)
        finally:
            scheduler.shutdown(wait=False)
            self.stdout.write(self.style.SUCCESS('Reminder scheduler stopped.'))
