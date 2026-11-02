"""Calendar-anchored recurrence; completion never advances or closes the parent."""
from calendar import monthrange
from datetime import date, timedelta

from django.db import transaction
from django.utils import timezone

from tickets.models import Self_Ticket, SelfTicketOccurrence

SCHEDULE_FIELDS = {'schedule_type', 'target_date', 'repeat_frequency', 'repeat_interval', 'repeat_until', 'repeat_weekdays', 'monthly_day_mode', 'repeat_day_of_month'}


def occurrence_dates(ticket, horizon):
    if ticket.repeat_interval < 1:
        raise ValueError("Repeat interval must be positive.")
    anchor = ticket.target_date
    end = min(horizon, ticket.repeat_until) if ticket.repeat_until else horizon
    if ticket.repeat_frequency == 'weekly':
        weekdays = sorted(set(ticket.repeat_weekdays or [anchor.weekday()]))
        week_start = anchor - timedelta(days=anchor.weekday())
        while week_start <= end:
            for weekday in weekdays:
                current = week_start + timedelta(days=weekday)
                if anchor <= current <= end:
                    yield current
            if (end - week_start).days < 7 * ticket.repeat_interval:
                return
            week_start += timedelta(weeks=ticket.repeat_interval)
        return
    index = 0
    while True:
        step = index * ticket.repeat_interval
        if ticket.repeat_frequency in {'daily', 'weekly'}:
            offset = step * (7 if ticket.repeat_frequency == 'weekly' else 1)
            if offset > (end - anchor).days:
                return
            current = anchor + timedelta(days=offset)
        else:
            months = step * (12 if ticket.repeat_frequency == 'yearly' else 1)
            year, month = divmod(anchor.year * 12 + anchor.month - 1 + months, 12)
            month += 1
            if year > end.year:
                return
            last_day = monthrange(year, month)[1]
            day = anchor.day
            if ticket.repeat_frequency == 'monthly':
                if ticket.monthly_day_mode == 'first':
                    day = 1
                elif ticket.monthly_day_mode == 'last':
                    day = last_day
                else:
                    day = ticket.repeat_day_of_month or anchor.day
            current = date(year, month, min(day, last_day))
        if current > end:
            return
        if current >= anchor:
            yield current
        index += 1


def ensure_occurrences(ticket, today=None, reset_future=False):
    today = today or timezone.localdate()
    if ticket.schedule_type != 'recurring':
        return
    horizon = today + timedelta(days=366)
    with transaction.atomic():
        # Serialize schedule edits and the daily reminder job for this task.
        ticket = Self_Ticket.objects.select_for_update().get(pk=ticket.pk)
        if ticket.schedule_type != 'recurring':
            return
        if reset_future:
            ticket.occurrences.filter(scheduled_date__gte=today, current_status='open').delete()
        existing = set(ticket.occurrences.values_list('scheduled_date', flat=True))
        SelfTicketOccurrence.objects.bulk_create([
            SelfTicketOccurrence(self_ticket=ticket, scheduled_date=day)
            for day in occurrence_dates(ticket, horizon) if day not in existing
        ])
