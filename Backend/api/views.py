from django.db.models import Prefetch, Q
from django.utils.dateparse import parse_date
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import RoleBasedPermission
from projects.models import AssignedTask, Milestone, Project
from .models import Submission, TimesheetStatus
from django.contrib.auth import get_user_model
from datetime import date, datetime, timedelta
from .serializers import (
    SubmissionSerializer,
    TimesheetDraftSerializer,
    TimesheetExtendTasksSerializer,
    TimesheetRemoveTasksSerializer,
    TimesheetStatusSerializer,
    ApprovalSerializer
)

User = get_user_model()
class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [RoleBasedPermission]

class TimesheetStatusViewSet(viewsets.ModelViewSet):
    serializer_class = TimesheetStatusSerializer
    permission_classes = [RoleBasedPermission]

    def get_queryset(self):
        queryset = TimesheetStatus.objects.select_related("uid")

        week_start_param = self.request.query_params.get("weekStart")
        timesheet_status = self.request.query_params.get(
            "timesheetstatus"
        )

        # Filter by weekStart
        if week_start_param:
            try:
                week_start = date.fromisoformat(
                    week_start_param
                )

                weekyear, weeknumber, _ = (
                    week_start.isocalendar()
                )

                queryset = queryset.filter(
                    weeknumber=weeknumber,
                    weekyear=weekyear,
                )

            except ValueError:
                return queryset.none()

        # Filter by timesheet status
        if timesheet_status:
            queryset = queryset.filter(
                timesheet_status__iexact=timesheet_status
            )

        return queryset

class TimesheetEntryViewSet(viewsets.ViewSet):
    permission_classes = [RoleBasedPermission]

    @action(detail=False, methods=['get'], url_path='entries')
    def entries(self, request):
        week_start = parse_date(request.query_params.get('week_start', ''))
        week_end = None
        if week_start:
            week_end = week_start + timedelta(days=6)

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
            milestones__assigned_tasks__in=assigned_tasks,
        ).distinct().prefetch_related(
            Prefetch(
                'milestones',
                queryset=Milestone.objects.filter(
                    assigned_tasks__in=assigned_tasks,
                ).distinct().prefetch_related(
                    Prefetch(
                        'assigned_tasks',
                        queryset=assigned_tasks,
                    )
                ),
            )
        ).order_by('id')

        project_payload = []
        for project in projects:
            milestones_payload = []
            for milestone in project.milestones.all():
                assigned_tasks_payload = []
                for assigned_task in milestone.assigned_tasks.all():
                    entries = {}
                    submissions = Submission.objects.filter(assignId=assigned_task)
                    if week_start and week_end:
                        submissions = submissions.filter(date__range=(week_start, week_end))

                    for submission in submissions.order_by('date'):
                        entries[submission.date.strftime('%Y-%m-%d')] = submission.hours

                    assigned_tasks_payload.append({
                        'assign_id': assigned_task.id,
                        'assign_by': assigned_task.assign_by.username if assigned_task.assign_by else None,
                        'name': assigned_task.task_obj.name if assigned_task.task_obj else None,
                        'entries': entries,
                    })

                milestones_payload.append({
                    'id': milestone.id,
                    'name': milestone.name,
                    'assigned_tasks': assigned_tasks_payload,
                })

            project_payload.append({
                'id': project.id,
                'name': project.name,
                'description':project.description,
                'quotation_id': project.quotation_id,
                'milestones': milestones_payload,
            })

        return Response(project_payload, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='save-draft')
    def save_draft(self, request):
        serializer = TimesheetDraftSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        saved_entries = []
        deleted_entries = []
        for entry in serializer.validated_data['entries']:
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
                    'status': 'Draft',
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

        return Response(
            {
                'message': 'Draft saved successfully.',
                'entries': saved_entries,
                'deleted_entries': deleted_entries,
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

class ApprovalViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ApprovalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            User.objects
            .select_related(
                "profile",
                "profile__reporting_to",
            )
            .filter(is_active=True)
        )
