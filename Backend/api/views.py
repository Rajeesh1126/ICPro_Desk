from django.db.models import Prefetch
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import RoleBasedPermission
from projects.models import AssignedTask, Milestone, Project
from .models import Submission, TimesheetStatus
from .serializers import SubmissionSerializer, TimesheetStatusSerializer


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [RoleBasedPermission]


class TimesheetStatusViewSet(viewsets.ModelViewSet):
    queryset = TimesheetStatus.objects.all()
    serializer_class = TimesheetStatusSerializer
    permission_classes = [RoleBasedPermission]


class TimesheetEntryViewSet(viewsets.ViewSet):
    permission_classes = [RoleBasedPermission]

    @action(detail=False, methods=['get'], url_path='entries')
    def entries(self, request):
        projects = Project.objects.prefetch_related(
            Prefetch(
                'milestones',
                queryset=Milestone.objects.prefetch_related(
                    Prefetch(
                        'assigned_tasks',
                        queryset=AssignedTask.objects.select_related('task_obj', 'milestone_obj', 'project_obj').order_by('id'),
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
                    for submission in Submission.objects.filter(assignId=assigned_task).order_by('date'):
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
                'quotation': project.quotation,
                'milestones': milestones_payload,
            })

        return Response(project_payload, status=status.HTTP_200_OK)

# class TimesheetApproveViewSet(viewsets.ViewSet):
#     permission_classes = [RoleBasedPermission]
