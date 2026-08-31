from datetime import timedelta

from django.db import transaction
from django.db.models import Prefetch, Q
from django.utils.dateparse import parse_date
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import RoleBasedPermission
from projects.models import AssignedTask, Milestone, Project, Task
from tickets.models import Ticket
from .models import Submission, TimesheetStatus
from .serializers import (
    ApprovalActionSerializer,
    SubmissionSerializer,
    TimesheetDraftSerializer,
    TimesheetAssignProjectSerializer,
    TimesheetAssignTicketsSerializer,
    TimesheetExtendTasksSerializer,
    TimesheetRemoveTasksSerializer,
    TimesheetSubmitSerializer,
    TimesheetStatusSerializer,
    TimesheetUnlockRequestSerializer,
)


def _display_name(user):
    if not user:
        return ''

    full_name = user.get_full_name()
    return full_name or user.username


def _week_bounds_from_request(request):
    week_start = parse_date(
        request.query_params.get('weekStart', '')
        or request.query_params.get('week_start', '')
    )
    if not week_start:
        return None, None

    return week_start, week_start + timedelta(days=6)


def _week_status(week_start):
    today = week_start.__class__.today()
    due_date = week_start + timedelta(days=7)

    if today <= due_date:
        return f'Due by {due_date.strftime("%d-%m-%Y")}'

    return 'Delayed'


def _sync_timesheet_status(user, week_start):
    week_end = week_start + timedelta(days=6)
    iso_year, iso_week, _ = week_start.isocalendar()

    timesheet_status = TimesheetStatus.objects.filter(
        uid=user,
        weeknumber=iso_week,
        weekyear=iso_year,
    ).first()

    submissions = Submission.objects.filter(
        assignId__assign_to=user,
        date__range=(week_start, week_end),
        hours__gt=0,
    )

    if not timesheet_status:
        return False

    has_submissions = submissions.exists()
    has_pending = submissions.exclude(status__in=['Accepted', 'Rejected']).exists()
    has_rejected = submissions.filter(status='Rejected').exists()
    all_accepted = has_submissions and not has_pending and not has_rejected

    timesheet_status.action_status = has_submissions and not has_pending
    if all_accepted:
        timesheet_status.timesheet_status = 'Accepted'
    elif has_submissions and not has_pending and has_rejected:
        timesheet_status.timesheet_status = 'Rejected'
    elif has_submissions:
        timesheet_status.timesheet_status = 'Submitted'

    timesheet_status.save(update_fields=['action_status', 'timesheet_status', 'updated_date'])
    return timesheet_status.action_status


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [RoleBasedPermission]


class TimesheetStatusViewSet(viewsets.ModelViewSet):
    queryset = TimesheetStatus.objects.all()
    serializer_class = TimesheetStatusSerializer
    permission_classes = [RoleBasedPermission]

    def get_permissions(self):
        if self.action in {'list', 'retrieve', 'partial_update', 'current', 'request_unlock'}:
            return [IsAuthenticated()]

        return super().get_permissions()

    def get_queryset(self):
        queryset = TimesheetStatus.objects.select_related('uid', 'uid__profile', 'uid__profile__reporting_to')
        user = self.request.user

        if not user or not user.is_authenticated:
            return TimesheetStatus.objects.none()

        if not (user.is_staff or user.is_superuser):
            queryset = queryset.filter(
                Q(uid__profile__reporting_to=user)
                | Q(uid__tasks__assign_by=user)
            ).distinct()

        week_start = parse_date(
            self.request.query_params.get('weekStart', '')
            or self.request.query_params.get('week_start', '')
        )
        if week_start:
            iso_year, iso_week, _ = week_start.isocalendar()
            queryset = queryset.filter(weeknumber=iso_week, weekyear=iso_year)

        requested_status = (
            self.request.query_params.get('timesheetstatus')
            or self.request.query_params.get('timesheet_status')
        )
        if requested_status:
            queryset = queryset.filter(timesheet_status=requested_status)

        return queryset.order_by('-updated_date')

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        requested_status = request.data.get('timesheet_status')

        if requested_status in {'Unlocked', 'Unlock Rejected'}:
            serializer = self.get_serializer(
                instance,
                data={
                    'timesheet_status': requested_status,
                    'comments': request.data.get('comments', instance.comments),
                },
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save(submission_status=False, action_status=False)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().partial_update(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='current')
    def current(self, request):
        week_start = parse_date(request.query_params.get('week_start', ''))
        if not week_start:
            return Response(
                {'detail': 'week_start query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        iso_year, iso_week, _ = week_start.isocalendar()
        timesheet_status = TimesheetStatus.objects.filter(
            uid=request.user,
            weeknumber=iso_week,
            weekyear=iso_year,
        ).first()

        if not timesheet_status:
            return Response(
                {
                    'timesheet_status': 'Not Submitted',
                    'weeknumber': iso_week,
                    'weekyear': iso_year,
                    'submission_status': False,
                    'comments': None,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            TimesheetStatusSerializer(timesheet_status).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='request-unlock')
    def request_unlock(self, request):
        serializer = TimesheetUnlockRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        week_start = serializer.validated_data['week_start']
        iso_year, iso_week, _ = week_start.isocalendar()

        existing_status = TimesheetStatus.objects.filter(
            uid=request.user,
            weeknumber=iso_week,
            weekyear=iso_year,
        ).first()

        if existing_status and existing_status.timesheet_status in {'Submitted', 'Accepted'}:
            return Response(
                {
                    'detail': 'Submitted or accepted time sheets cannot request unlock.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        timesheet_status, _ = TimesheetStatus.objects.update_or_create(
            uid=request.user,
            weeknumber=iso_week,
            weekyear=iso_year,
            defaults={
                'timesheet_status': 'Requested',
                'unlock_reason': serializer.validated_data['unlock_reason'],
                'submission_status': False,
            },
        )

        return Response(
            {
                'message': 'Unlock request submitted successfully.',
                'timesheet_status': TimesheetStatusSerializer(timesheet_status).data,
            },
            status=status.HTTP_201_CREATED,
        )


class TimesheetApprovalViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Submission.objects.all()

    def list(self, request):
        week_start, week_end = _week_bounds_from_request(request)
        if not week_start:
            return Response(
                {'detail': 'weekStart query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        iso_year, iso_week, _ = week_start.isocalendar()
        submissions = (
            Submission.objects
            .filter(
                assignId__assign_by=request.user,
                date__range=(week_start, week_end),
                hours__gt=0,
            )
            .select_related(
                'assignId',
                'assignId__assign_to',
                'assignId__assign_to__profile',
                'assignId__assign_to__profile__reporting_to',
            )
            .order_by('assignId__assign_to__first_name', 'assignId__assign_to__username')
        )

        employees = {}
        for submission in submissions:
            employee = submission.assignId.assign_to
            if not employee:
                continue

            employee_data = employees.setdefault(
                employee.id,
                {
                    'id': employee.id,
                    'name': _display_name(employee),
                    'reporting_to': _display_name(
                        getattr(getattr(employee, 'profile', None), 'reporting_to', None)
                    ),
                    'hours': 0,
                    'statuses': [],
                },
            )
            employee_data['hours'] += submission.hours
            employee_data['statuses'].append(submission.status or 'Submitted')

        timesheet_statuses = {
            item.uid_id: item
            for item in TimesheetStatus.objects.filter(
                uid_id__in=employees.keys(),
                weeknumber=iso_week,
                weekyear=iso_year,
            )
        }

        payload = []
        for employee_id, employee_data in employees.items():
            statuses = employee_data.pop('statuses')
            timesheet_status = timesheet_statuses.get(employee_id)

            if timesheet_status:
                overview = timesheet_status.timesheet_status or 'Submitted'
            elif all(item == 'Accepted' for item in statuses):
                overview = 'Accepted'
            elif any(item == 'Rejected' for item in statuses):
                overview = 'Rejected'
            else:
                overview = 'Submitted'

            payload.append({
                **employee_data,
                'overview': overview,
                'submission_status': 'OnTime',
                'approval_status': _week_status(week_start),
            })

        return Response(payload, status=status.HTTP_200_OK)


class ApprovalDetailDataViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Submission.objects.all()

    def list(self, request):
        week_start, week_end = _week_bounds_from_request(request)
        employee_id = request.query_params.get('employeeId') or request.query_params.get('employee_id')
        if not week_start or not employee_id:
            return Response(
                {'detail': 'weekStart and employeeId query parameters are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            employee_id = int(employee_id)
        except (TypeError, ValueError):
            return Response(
                {'detail': 'employeeId must be a valid user id.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assigned_tasks = (
            AssignedTask.objects
            .filter(
                assign_by=request.user,
                assign_to_id=employee_id,
                submission__date__range=(week_start, week_end),
                submission__hours__gt=0,
            )
            .select_related('project_obj', 'task_obj', 'milestone_obj', 'assign_by')
            .prefetch_related(
                Prefetch(
                    'submission_set',
                    queryset=Submission.objects.filter(
                        date__range=(week_start, week_end),
                        hours__gt=0,
                    ).order_by('date'),
                )
            )
            .distinct()
            .order_by('project_obj__code', 'milestone_obj__name', 'task_obj__name', 'id')
        )

        days = [week_start + timedelta(days=index) for index in range(7)]
        rows = []
        for assigned_task in assigned_tasks:
            submissions_by_date = {
                submission.date: submission
                for submission in assigned_task.submission_set.all()
            }
            submissions = list(submissions_by_date.values())
            first_submission = submissions[0] if submissions else None
            project = assigned_task.project_obj
            task = assigned_task.task_obj

            rows.append({
                'id': assigned_task.id,
                'projectId': project.id if project else None,
                'project': project.code if project and project.code else str(project or ''),
                'task': task.name if task else (project.description if project else ''),
                'budgetOwner': _display_name(assigned_task.assign_by),
                'hours': [
                    str(submissions_by_date[day].hours) if day in submissions_by_date else ''
                    for day in days
                ],
                'rating': first_submission.rate if first_submission else '',
                'status': first_submission.status if first_submission and first_submission.status else 'Pending',
                'approvedStatus': bool(first_submission.approved_status) if first_submission else False,
                'rejectionReason': first_submission.rejection_reason if first_submission else None,
            })

        iso_year, iso_week, _ = week_start.isocalendar()
        timesheet_status = TimesheetStatus.objects.filter(
            uid_id=employee_id,
            weeknumber=iso_week,
            weekyear=iso_year,
        ).first()

        return Response(
            {
                'rows': rows,
                'comments': timesheet_status.comments if timesheet_status else '',
                'action_status': timesheet_status.action_status if timesheet_status else False,
            },
            status=status.HTTP_200_OK,
        )

    def partial_update(self, request):
        serializer = ApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        week_start = serializer.validated_data['weekStart']
        week_end = week_start + timedelta(days=6)
        employee = serializer.validated_data['employeeId']
        assigned_task = serializer.validated_data['assignId']
        action_value = serializer.validated_data['action']
        rating = serializer.validated_data['rating']
        comments = serializer.validated_data.get('comments') or None

        if assigned_task.assign_by_id != request.user.id or assigned_task.assign_to_id != employee.id:
            return Response(
                {'detail': 'You can review only time sheet rows assigned to you as budget owner.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        submissions = Submission.objects.filter(
            assignId=assigned_task,
            date__range=(week_start, week_end),
            hours__gt=0,
        )

        if not submissions.exists():
            return Response(
                {'detail': 'No submitted hours found for this assigned task and week.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        with transaction.atomic():
            submissions.update(
                rate=rating,
                status=action_value,
                approvedBy=request.user,
                approved_status=action_value == 'Accepted',
                rejection_reason=comments if action_value == 'Rejected' else None,
            )
            action_status = _sync_timesheet_status(employee, week_start)

        return Response(
            {
                'message': 'Approval updated successfully.',
                'assignId': assigned_task.id,
                'action': action_value,
                'rating': rating,
                'action_status': action_status,
            },
            status=status.HTTP_200_OK,
        )


class TimesheetEntryViewSet(viewsets.ViewSet):
    permission_classes = [RoleBasedPermission]

    def _default_budget_owner(self, user):
        return getattr(getattr(user, 'profile', None), 'reporting_to', None)

    def _ensure_other_activity_assignments(self, user):
        others_project = Project.objects.filter(code__iexact='Others').first()
        if not others_project:
            return

        default_budget_owner = self._default_budget_owner(user)
        other_tasks = Task.objects.filter(project=others_project).select_related('milestone')
        for task in other_tasks:
            AssignedTask.objects.get_or_create(
                assign_to=user,
                project_obj=others_project,
                task_obj=task,
                milestone_obj=task.milestone,
                defaults={
                    'assign_by': default_budget_owner,
                },
            )

    def _assigned_task_payload(self, assigned_task, week_start, week_end):
        entries = {}
        submissions = Submission.objects.filter(assignId=assigned_task)
        if week_start and week_end:
            submissions = submissions.filter(date__range=(week_start, week_end))

        for submission in submissions.order_by('date'):
            entries[submission.date.strftime('%Y-%m-%d')] = submission.hours

        return {
            'assign_id': assigned_task.id,
            'assign_by': assigned_task.assign_by.username if assigned_task.assign_by else None,
            'name': (
                assigned_task.task_obj.name
                if assigned_task.task_obj
                else assigned_task.project_obj.description
                if assigned_task.project_obj
                else None
            ),
            'entries': entries,
        }

    def _save_entries(self, entries, entry_status):
        saved_entries = []
        deleted_entries = []

        for entry in entries:
            if entry['hours'] == 0:
                deleted_count, _ = Submission.objects.filter(
                    assignId=entry['assignId'],
                    date=entry['date'],
                ).delete()

                if deleted_count:
                    deleted_entries.append({
                        'assignId': entry['assignId'].id,
                        'date': entry['date'].strftime('%Y-%m-%d'),
                    })

                continue

            submission, _ = Submission.objects.update_or_create(
                assignId=entry['assignId'],
                date=entry['date'],
                defaults={
                    'hours': entry['hours'],
                    'rate': entry.get('rate', 0),
                    'status': entry_status,
                    'approvedBy': entry['assignId'].assign_by,
                    'approved_status': False,
                },
            )
            saved_entries.append({
                'id': submission.id,
                'assignId': submission.assignId_id,
                'date': submission.date.strftime('%Y-%m-%d'),
                'hours': submission.hours,
                'rate': submission.rate,
                'status': submission.status,
            })

        return saved_entries, deleted_entries

    @action(detail=False, methods=['get'], url_path='entries')
    def entries(self, request):
        week_start = parse_date(request.query_params.get('week_start', ''))
        week_end = None
        if week_start:
            week_end = week_start + timedelta(days=6)

        self._ensure_other_activity_assignments(request.user)

        assigned_task_filters = Q(assign_to=request.user)
        if week_start and week_end:
            assigned_task_filters &= (
                Q(end_date__isnull=True) | Q(end_date__gte=week_start)
            ) & (
                Q(start_date__isnull=True) | Q(start_date__lte=week_end)
            )

        assigned_tasks = AssignedTask.objects.filter(
            assigned_task_filters,
        ).select_related(
            'task_obj',
            'milestone_obj',
            'project_obj',
        ).order_by('id')

        projects = Project.objects.filter(
            assigned_tasks__in=assigned_tasks,
        ).distinct().prefetch_related(
            'milestones',
        ).order_by('id')

        projects = sorted(projects, key=lambda project: (project.code or '').lower() == 'others')

        project_payload = []
        for project in projects:
            milestones_payload = []
            for milestone in project.milestones.all():
                milestone_assigned_tasks = [
                    assigned_task
                    for assigned_task in assigned_tasks
                    if assigned_task.project_obj_id == project.id
                    and assigned_task.milestone_obj_id == milestone.id
                ]
                if not milestone_assigned_tasks:
                    continue

                assigned_tasks_payload = []
                for assigned_task in milestone_assigned_tasks:
                    assigned_tasks_payload.append(
                        self._assigned_task_payload(assigned_task, week_start, week_end)
                    )

                milestones_payload.append({
                    'id': milestone.id,
                    'name': milestone.name,
                    'assigned_tasks': assigned_tasks_payload,
                })

            ungrouped_assigned_tasks = [
                assigned_task
                for assigned_task in assigned_tasks
                if assigned_task.project_obj_id == project.id
                and assigned_task.milestone_obj_id is None
            ]
            if ungrouped_assigned_tasks:
                milestones_payload.append({
                    'id': -project.id,
                    'name': 'General',
                    'assigned_tasks': [
                        self._assigned_task_payload(assigned_task, week_start, week_end)
                        for assigned_task in ungrouped_assigned_tasks
                    ],
                })

            project_payload.append({
                'id': project.id,
                'code': project.code,
                'description':project.description,
                'quotation_id': project.quotation_id,
                'milestones': milestones_payload,
            })

        return Response(project_payload, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='ticket-options')
    def ticket_options(self, request):
        tickets = (
            Ticket.objects
            .filter(assigned_to=request.user)
            .exclude(current_status__in=['open', 'closed'])
            .order_by('-created_at')
        )

        return Response(
            [
                {
                    'id': ticket.id,
                    'number': ticket.number,
                    'task': ticket.task,
                    'current_status': ticket.current_status,
                    'priority': ticket.priority,
                    'target_date': ticket.target_date,
                }
                for ticket in tickets
            ],
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='assign-tickets')
    def assign_tickets(self, request):
        serializer = TimesheetAssignTicketsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        created_assignments = []
        default_budget_owner = self._default_budget_owner(request.user)
        with transaction.atomic():
            for ticket in serializer.validated_data['ticket_ids']:
                project, _ = Project.objects.get_or_create(
                    code=ticket.number,
                    defaults={
                        'description': ticket.task,
                        'customer': ticket.creator.get_full_name() or ticket.creator.username,
                    },
                )
                if project.description != ticket.task:
                    project.description = ticket.task
                    project.save(update_fields=['description'])

                assigned_task, _ = AssignedTask.objects.get_or_create(
                    project_obj=project,
                    assign_to=request.user,
                    task_obj=None,
                    milestone_obj=None,
                    defaults={
                        'assign_by': default_budget_owner,
                    },
                )
                created_assignments.append(assigned_task.id)

        return Response(
            {
                'message': 'Tickets assigned to timesheet successfully.',
                'assigned_task_ids': created_assignments,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['post'], url_path='assign-project')
    def assign_project(self, request):
        serializer = TimesheetAssignProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        default_budget_owner = self._default_budget_owner(request.user)
        assigned_task, _ = AssignedTask.objects.get_or_create(
            project_obj=serializer.validated_data['project_id'],
            assign_to=request.user,
            task_obj=None,
            milestone_obj=None,
            defaults={
                'assign_by': default_budget_owner,
            },
        )

        return Response(
            {
                'message': 'Project assigned to timesheet successfully.',
                'assigned_task_id': assigned_task.id,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['post'], url_path='save-draft')
    def save_draft(self, request):
        serializer = TimesheetDraftSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        saved_entries, deleted_entries = self._save_entries(
            serializer.validated_data['entries'],
            'Draft',
        )

        return Response(
            {
                'message': 'Draft saved successfully.',
                'entries': saved_entries,
                'deleted_entries': deleted_entries,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='submit')
    def submit(self, request):
        serializer = TimesheetSubmitSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        week_start = serializer.validated_data['week_start']
        week_number = week_start.isocalendar()[1]
        week_year = week_start.isocalendar()[0]
        comments = serializer.validated_data.get('comments') or None

        with transaction.atomic():
            saved_entries, deleted_entries = self._save_entries(
                serializer.validated_data['entries'],
                'Submitted',
            )

            timesheet_status, _ = TimesheetStatus.objects.update_or_create(
                uid=request.user,
                weeknumber=week_number,
                weekyear=week_year,
                defaults={
                    'timesheet_status': 'Submitted',
                    'submission_status': True,
                    'comments': comments,
                },
            )

        return Response(
            {
                'message': 'Time sheet submitted successfully.',
                'entries': saved_entries,
                'deleted_entries': deleted_entries,
                'timesheet_status': TimesheetStatusSerializer(timesheet_status).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='extend-tasks')
    def extend_tasks(self, request):
        serializer = TimesheetExtendTasksSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        assigned_tasks = serializer.validated_data['assigned_task_ids']
        end_date = serializer.validated_data['end_date']

        updated_count = AssignedTask.objects.filter(
            id__in=[assigned_task.id for assigned_task in assigned_tasks],
            assign_to=request.user,
        ).update(end_date=end_date)

        return Response(
            {
                'message': 'Assigned tasks extended successfully.',
                'updated_count': updated_count,
                'end_date': end_date.strftime('%Y-%m-%d'),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='remove-tasks')
    def remove_tasks(self, request):
        serializer = TimesheetRemoveTasksSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        assigned_tasks = serializer.validated_data['assigned_task_ids']
        week_start = serializer.validated_data['week_start']
        week_end = week_start + timedelta(days=6)
        previous_week_end = week_start - timedelta(days=1)

        removed_task_ids = []
        shortened_task_ids = []
        blocked_task_ids = []

        for assigned_task in assigned_tasks:
            submissions = Submission.objects.filter(assignId=assigned_task)

            if submissions.filter(date__range=(week_start, week_end)).exists():
                blocked_task_ids.append(assigned_task.id)
                continue

            if submissions.exists():
                assigned_task.end_date = previous_week_end
                assigned_task.save(update_fields=['end_date'])
                shortened_task_ids.append(assigned_task.id)
                continue

            assigned_task_id = assigned_task.id
            assigned_task.delete()
            removed_task_ids.append(assigned_task_id)

        return Response(
            {
                'message': 'Selected tasks removed where possible.',
                'removed_task_ids': removed_task_ids,
                'shortened_task_ids': shortened_task_ids,
                'blocked_task_ids': blocked_task_ids,
                'end_date': previous_week_end.strftime('%Y-%m-%d'),
            },
            status=status.HTTP_200_OK,
        )






# class TimesheetApproveViewSet(viewsets.ViewSet):
#     permission_classes = [RoleBasedPermission]
