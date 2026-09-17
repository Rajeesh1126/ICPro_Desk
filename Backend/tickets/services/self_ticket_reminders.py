from django.template.defaultfilters import date as format_date
from django.utils import timezone
from django.utils.html import escape

from core.microsoftGraphAPI import send_mail
from tickets.models import Self_Ticket


REMINDER_STATUSES = {'open', 'assigned', 'accepted', 'on hold', 'in progress', 'modified'}


def due_self_ticket_queryset(today=None):
    today = today or timezone.localdate()

    return (
        Self_Ticket.objects
        .select_related('creator')
        .filter(
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

    return reminded_tickets
