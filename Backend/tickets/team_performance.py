"""Read-only performance reporting for a manager's direct reportees."""
from collections import Counter
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Prefetch, Q
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Self_Ticket, SelfTicketOccurrence, Ticket
from .services.self_ticket_schedule import occurrence_dates

User = get_user_model()
EXCLUDED_STATUSES = {'cancelled', 'recall successful'}
DONE_STATUSES = {'completed', 'closed'}


class CanViewTeamPerformance(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_staff or user.is_superuser:
            return True
        role = getattr(getattr(user, 'profile', None), 'role', None)
        return bool(role and role.permissions.filter(codename='access_team_analysis').exists())


def _counts(items):
    total = len(items)
    completed = sum(item['current_status'] in DONE_STATUSES for item in items)
    return {'total': total, 'completed': completed,
            'progress': round(100 * completed / total, 1) if total else 0}


class TeamPerformanceView(APIView):
    permission_classes = [IsAuthenticated, CanViewTeamPerformance]

    def get(self, request):
        today = timezone.localdate()
        monday = today - timedelta(days=today.weekday())
        dates = {}
        for key, default in [('start_date', monday), ('end_date', monday + timedelta(days=6))]:
            raw = request.query_params.get(key)
            try:
                value = parse_date(raw) if raw else default
            except ValueError:
                value = None
            if value is None:
                raise ValidationError({key: 'Enter a valid date in YYYY-MM-DD format.'})
            dates[key] = value
        start, end = dates['start_date'], dates['end_date']
        if start > end:
            raise ValidationError({'end_date': 'End date must be on or after start date.'})

        # Deliberately independent of executive/team-membership visibility rules.
        # Neither an employee_id nor include_executive parameter can expand this scope.
        employees = list(User.objects.filter(
            profile__reporting_to=request.user, is_active=True,
        ).exclude(pk=request.user.pk).order_by('first_name', 'last_name', 'username'))
        employee_ids = [employee.id for employee in employees]
        work = []
        tickets = Ticket.objects.filter(
            assigned_to_id__in=employee_ids, is_internal=True, target_date__range=(start, end),
        ).exclude(current_status__in=EXCLUDED_STATUSES).select_related('creator', 'assigned_to')
        for ticket in tickets:
            work.append({
                'id': f'worklet-{ticket.id}', 'employee_id': ticket.assigned_to_id,
                'kind': 'Work Let', 'number': ticket.number, 'task': ticket.task,
                'description': ticket.description, 'current_status': ticket.current_status,
                'priority': ticket.priority, 'target_date': ticket.target_date,
                'creator_name': ticket.creator.get_full_name() or ticket.creator.username,
                'assigned_to_name': ticket.assigned_to.get_full_name() or ticket.assigned_to.username,
                'est_hours': float(ticket.est_hours), 'schedule': 'Ticket',
            })
        dolist = Self_Ticket.objects.filter(creator_id__in=employee_ids).exclude(
            current_status__in=EXCLUDED_STATUSES,
        ).filter(
            Q(schedule_type='static', target_date__range=(start, end))
            | Q(schedule_type='period', start_date__lte=end, target_date__gte=start)
            | Q(schedule_type='recurring', target_date__lte=end),
        ).select_related('creator').prefetch_related(Prefetch(
            'occurrences',
            queryset=SelfTicketOccurrence.objects.filter(scheduled_date__range=(start, end)),
            to_attr='report_occurrences',
        ))
        for task in dolist:
            if task.schedule_type == 'recurring':
                if not task.is_active:
                    continue
                stored = {item.scheduled_date: item for item in task.report_occurrences}
                due = [(day, stored[day].current_status if day in stored else 'open')
                       for day in occurrence_dates(task, end) if day >= start]
            else:
                due = [(task.target_date, task.current_status)]
            for day, state in due:
                if state in EXCLUDED_STATUSES:
                    continue
                name = task.creator.get_full_name() or task.creator.username
                work.append({
                    'id': f'dolist-{task.id}-{day.isoformat()}', 'employee_id': task.creator_id,
                    'kind': 'Do List', 'number': task.number, 'task': task.task,
                    'description': task.description, 'current_status': state,
                    'priority': task.priority, 'target_date': day,
                    'creator_name': name, 'assigned_to_name': name,
                    'est_hours': float(task.est_hours),
                    'schedule': {'static': 'Event', 'period': 'Period', 'recurring': 'Recurring'}[task.schedule_type],
                })
        work.sort(key=lambda item: (item['target_date'], item['employee_id'], item['id']))
        by_employee = {employee.id: [] for employee in employees}
        for item in work:
            by_employee[item['employee_id']].append(item)
        payload = []
        for employee in employees:
            items = by_employee[employee.id]
            total = _counts(items)
            payload.append({
                'id': employee.id, 'name': employee.get_full_name() or employee.username,
                'username': employee.username, 'count': total['total'], **total,
                'worklet': _counts([item for item in items if item['kind'] == 'Work Let']),
                'dolist': _counts([item for item in items if item['kind'] == 'Do List']),
            })
        return Response({
            'start_date': start, 'end_date': end, 'employees': payload,
            'total': len(work), 'statuses': dict(Counter(item['current_status'] for item in work)),
            'work_items': work,
        })
