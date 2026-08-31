from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import RoleBasedPermission
from .models import AssignedTask, Milestone, Phases, Project, Task
from .serializers import (
    AddCostMasterTasksSerializer,
    AssignedTaskSerializer,
    MilestoneSerializer,
    PhaseSerializer,
    ProjectSerializer,
    TaskSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [RoleBasedPermission]

    @action(detail=True, methods=['post'], url_path='cost-master-tasks')
    def cost_master_tasks(self, request, pk=None):
        serializer = AddCostMasterTasksSerializer(
            data=request.data,
            context={
                'request': request,
                'project': self.get_object(),
            },
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(result)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [RoleBasedPermission]


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer
    permission_classes = [RoleBasedPermission]


class PhaseViewSet(viewsets.ModelViewSet):
    queryset = Phases.objects.all().order_by('phase', 'cost_category')
    serializer_class = PhaseSerializer
    permission_classes = [RoleBasedPermission]


class AssignedTaskViewSet(viewsets.ModelViewSet):
    queryset = AssignedTask.objects.all()
    serializer_class = AssignedTaskSerializer
    permission_classes = [RoleBasedPermission]
