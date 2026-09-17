from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils.html import escape
from django.template.defaultfilters import date as format_date
from django.utils import timezone

from api.models import Submission, TimesheetWeekLog
from core.microsoftGraphAPI import send_mail


User = get_user_model()


DAILY_REMINDER_WEEKDAYS = {1, 2, 3, 4}
WEEKLY_REMINDER_WEEKDAY = 4
SUBMITTED_WEEK_STATUSES = {'Submitted', 'Accepted', 'Rejected'}


def excluded_timesheet_role_names():
    return [
        role.strip()
        for role in getattr(settings, 'TIMESHEET_EXCLUDED_ROLE_NAMES', [])
        if role and role.strip()
    ]


def exclude_timesheet_roles(queryset):
    role_names = excluded_timesheet_role_names()
    if not role_names:
        return queryset

    return queryset.exclude(profile__role__name__in=role_names)


def active_timesheet_users(for_date):
    queryset = (
        User.objects
        .filter(is_active=True)
        .exclude(profile__isnull=True)
        .exclude(is_superuser=True)
        .exclude(email='')
        .exclude(email__isnull=True)
        .filter(date_joined__date__lte=for_date)
        .filter(Q(profile__resign_date__isnull=True) | Q(profile__resign_date__gte=for_date))
    )
    return exclude_timesheet_roles(queryset).order_by('username')


def users_missing_daily_timesheet(entry_date):
    user_ids_with_entries = Submission.objects.filter(
        assignId__assign_to__isnull=False,
        date=entry_date,
        hours__gt=0,
    ).values_list('assignId__assign_to_id', flat=True)

    return active_timesheet_users(entry_date).exclude(id__in=user_ids_with_entries)


def users_missing_weekly_submission(week_start):
    iso_year, iso_week, _ = week_start.isocalendar()

    submitted_user_ids = TimesheetWeekLog.objects.filter(
        weekyear=iso_year,
        weeknumber=iso_week,
    ).filter(
        Q(submission_status=True) | Q(timesheet_status__in=SUBMITTED_WEEK_STATUSES)
    ).values_list('uid_id', flat=True)

    week_end = week_start + timedelta(days=6)
    return active_timesheet_users(week_end).exclude(id__in=submitted_user_ids)


def _display_name(user):
    full_name = user.get_full_name()
    return full_name or user.username


def send_daily_timesheet_reminders(today=None, force=False):
    today = today or timezone.localdate()
    if not force and today.weekday() not in DAILY_REMINDER_WEEKDAYS:
        return []

    missed_date = today - timedelta(days=1)
    reminded_users = []

    for user in users_missing_daily_timesheet(missed_date):
        send_mail(
            f'Timesheet reminder - {format_date(missed_date, "d-m-Y")}',
            (
                f'<p>Hello {escape(_display_name(user))},</p>'
                f'<p>You have not filled your timesheet for {format_date(missed_date, "d-m-Y")}.</p>'
                '<p>Please update and submit your timesheet as soon as possible.</p>'
                '<p>Regards,<br>ICPro Desk</p>'
            ),
            [user.email],
        )
        reminded_users.append(user)

    return reminded_users


def send_weekly_timesheet_submission_reminders(today=None, force=False):
    today = today or timezone.localdate()
    if not force and today.weekday() != WEEKLY_REMINDER_WEEKDAY:
        return []

    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    reminded_users = []

    for user in users_missing_weekly_submission(week_start):
        send_mail(
            f'Weekly timesheet submission reminder - Week {week_start.isocalendar()[1]}',
            (
                f'<p>Hello {escape(_display_name(user))},</p>'
                '<p>This is a reminder to submit your weekly timesheet for '
                f'{format_date(week_start, "d-m-Y")} to {format_date(week_end, "d-m-Y")}.</p>'
                '<p>Please submit it before the end of the day.</p>'
                '<p>Regards,<br>ICPro Desk</p>'
            ),
            [user.email],
        )
        reminded_users.append(user)

    return reminded_users
