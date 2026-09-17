import logging
from datetime import timedelta

from django.db import transaction
from django.template.defaultfilters import date as format_date
from django.utils.html import escape

from core.microsoftGraphAPI import send_mail
from projects.models import AssignedTask


logger = logging.getLogger(__name__)


def _display_name(user):
    if not user:
        return ''

    full_name = user.get_full_name()
    return full_name or user.username


def _user_email(user):
    email = getattr(user, 'email', '')
    return email.strip() if email else ''


def _send_after_commit(subject, html, recipients):
    recipient_list = sorted({email for email in recipients if email})
    if not recipient_list:
        return

    def send_notification():
        try:
            send_mail(subject, html, recipient_list)
        except Exception:
            logger.exception('Failed to send timesheet notification email: %s', subject)

    transaction.on_commit(send_notification)


def _week_range_text(week_start):
    week_end = week_start + timedelta(days=6)
    return f'{format_date(week_start, "d-m-Y")} to {format_date(week_end, "d-m-Y")}'


def send_timesheet_submission_notification(employee, week_start, saved_entries):
    assignment_ids = {
        entry['assignId']
        for entry in saved_entries
        if entry.get('assignId')
    }
    approver_emails = {
        _user_email(assigned_task.assign_by)
        for assigned_task in AssignedTask.objects.select_related('assign_by').filter(id__in=assignment_ids)
        if assigned_task.assign_by
    }

    reporting_manager = getattr(getattr(employee, 'profile', None), 'reporting_to', None)
    if reporting_manager:
        approver_emails.add(_user_email(reporting_manager))

    _send_after_commit(
        f'Timesheet submitted - {_display_name(employee)}',
        (
            f'<p>Hello,</p>'
            f'<p>{escape(_display_name(employee))} submitted a timesheet for '
            f'{_week_range_text(week_start)}.</p>'
            '<p>Please review the submitted entries.</p>'
            '<p>Regards,<br>ICPro Desk</p>'
        ),
        approver_emails,
    )


def send_unlock_request_notification(employee, week_start, reason):
    reporting_manager = getattr(getattr(employee, 'profile', None), 'reporting_to', None)

    _send_after_commit(
        f'Timesheet unlock requested - {_display_name(employee)}',
        (
            f'<p>Hello {escape(_display_name(reporting_manager))},</p>'
            f'<p>{escape(_display_name(employee))} requested unlock for the timesheet week '
            f'{_week_range_text(week_start)}.</p>'
            f'<p><strong>Reason:</strong> {escape(reason or "")}</p>'
            '<p>Please review the unlock request.</p>'
            '<p>Regards,<br>ICPro Desk</p>'
        ),
        [_user_email(reporting_manager)],
    )


def send_unlock_decision_notification(timesheet_status, action_by=None):
    if timesheet_status.timesheet_status not in {'Unlocked', 'Unlock Rejected'}:
        return

    employee = timesheet_status.uid
    week_start = timesheet_status.created_date.date()
    if timesheet_status.weekyear and timesheet_status.weeknumber:
        week_start = week_start.fromisocalendar(timesheet_status.weekyear, timesheet_status.weeknumber, 1)

    decision = 'accepted' if timesheet_status.timesheet_status == 'Unlocked' else 'rejected'
    action_by_text = f' by {escape(_display_name(action_by))}' if action_by else ''

    _send_after_commit(
        f'Timesheet unlock {decision} - Week {timesheet_status.weeknumber}',
        (
            f'<p>Hello {escape(_display_name(employee))},</p>'
            f'<p>Your timesheet unlock request for {_week_range_text(week_start)} was '
            f'{decision}{action_by_text}.</p>'
            f'<p><strong>Comments:</strong> {escape(timesheet_status.comments or "")}</p>'
            '<p>Regards,<br>ICPro Desk</p>'
        ),
        [_user_email(employee)],
    )


def send_timesheet_rejection_notification(employee, approver, assigned_task, week_start, comments):
    task = assigned_task.task_obj
    project = assigned_task.project_obj

    _send_after_commit(
        f'Timesheet task rejected - Week {week_start.isocalendar()[1]}',
        (
            f'<p>Hello {escape(_display_name(employee))},</p>'
            f'<p>Your timesheet entry was rejected by {escape(_display_name(approver))}.</p>'
            '<ul>'
            f'<li><strong>Week:</strong> {_week_range_text(week_start)}</li>'
            f'<li><strong>Project:</strong> {escape(project.code if project and project.code else str(project or ""))}</li>'
            f'<li><strong>Task:</strong> {escape(task.name if task else str(project or ""))}</li>'
            f'<li><strong>Comments:</strong> {escape(comments or "")}</li>'
            '</ul>'
            '<p>Please update and resubmit the timesheet entry.</p>'
            '<p>Regards,<br>ICPro Desk</p>'
        ),
        [_user_email(employee)],
    )
