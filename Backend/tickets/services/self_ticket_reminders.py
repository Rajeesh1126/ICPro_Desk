from django.template.defaultfilters import date as format_date
from datetime import timedelta
from django.db import models, transaction
from django.utils import timezone
from django.utils.html import escape

from core.microsoftGraphAPI import send_mail
from tickets.models import Self_Ticket


REMINDER_STATUSES = {
    'open',
    'assigned',
    'accepted',
    'on hold',
    'in progress',
    'revised',
    'date revision',
    'pending',
}


def due_self_ticket_queryset(today=None):
    today = today or timezone.localdate()

    return (
        Self_Ticket.objects
        .select_related('creator')
        .filter(
            reminder_mode='legacy',
            is_active=True,
            current_status__in=REMINDER_STATUSES,
            reminder_interval__gt=0,
            created_at__date__lt=today,
        )
    )


def is_reminder_due(ticket, today):
    created_date = ticket.created_at.date()
    days_since_created = (today - created_date).days
    return days_since_created > 0 and days_since_created % ticket.reminder_interval == 0


def send_self_ticket_reminders(today=None):
    today = today or timezone.localdate()
    reminded_tickets = []

    for ticket in due_self_ticket_queryset(today):
        if not is_reminder_due(ticket, today):
            continue

        recipient = ticket.creator.email
        if recipient:
            send_mail(
                f'Self ticket reminder - {ticket.task}',
                (
                    f'<p>Reminder for self ticket <strong>{escape(ticket.task)}</strong></p>'
                    '<ul>'
                    f'<li><strong>Number:</strong> {escape(ticket.number)}</li>'
                    f'<li><strong>Priority:</strong> {escape(ticket.priority)}</li>'
                    f'<li><strong>Status:</strong> {escape(ticket.current_status)}</li>'
                    f'<li><strong>Target date:</strong> {format_date(ticket.target_date, "d-m-Y")}</li>'
                    '</ul>'
                ),
                [recipient],
            )

        ticket.alarm = True
        ticket.save(update_fields=['alarm', 'updated_at'])
        reminded_tickets.append(ticket)

    reminded_tickets.extend(send_scheduled_reminders(today))
    return reminded_tickets


def send_scheduled_reminders(today):
    from .self_ticket_schedule import ensure_occurrences
    reminded = []
    tasks = Self_Ticket.objects.filter(
        is_active=True, current_status__in=REMINDER_STATUSES,
    ).filter(models.Q(schedule_type='recurring') | models.Q(reminder_mode='before_due'))
    for candidate in tasks:
        ensure_occurrences(candidate, today)
        if candidate.reminder_mode != 'before_due' or not candidate.reminder_days_before:
            continue
        with transaction.atomic():
            ticket = Self_Ticket.objects.select_for_update().select_related('creator').get(pk=candidate.pk)
            if not ticket.is_active or ticket.current_status not in REMINDER_STATUSES:
                continue
            if ticket.schedule_type == 'recurring':
                occurrences = ticket.occurrences.filter(
                    current_status='open', reminded_at__isnull=True,
                    scheduled_date__gt=today,
                    scheduled_date__lte=today + timedelta(days=ticket.reminder_days_before),
                )
                for occurrence in occurrences:
                    _send_due_reminder(ticket, occurrence.scheduled_date)
                    occurrence.reminded_at = timezone.now()
                    occurrence.alarm = True
                    occurrence.save(update_fields=['reminded_at', 'alarm'])
                    if ticket not in reminded:
                        reminded.append(ticket)
                if ticket in reminded:
                    ticket.alarm = True
                    ticket.save(update_fields=['alarm', 'updated_at'])
            elif (today < ticket.target_date <= today + timedelta(days=ticket.reminder_days_before)
                  and ticket.last_reminded_for != ticket.target_date):
                _send_due_reminder(ticket, ticket.target_date)
                ticket.last_reminded_for = ticket.target_date
                ticket.alarm = True
                ticket.save(update_fields=['last_reminded_for', 'alarm', 'updated_at'])
                reminded.append(ticket)
    return reminded


def _send_due_reminder(ticket, due_date):
    if ticket.creator.email:
        send_mail(
            f'Do List reminder - {ticket.number} - {ticket.task}',
            f'<p>{escape(ticket.task)} is due on {format_date(due_date, "d-m-Y")}.</p>',
            [ticket.creator.email],
        )
