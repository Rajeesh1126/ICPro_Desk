from rest_framework import viewsets

from .models import AssignedTask, Submission, Project, Task, Milestone, TimesheetStatus
from .serializers import (
    AssignedTaskSerializer,
    SubmissionSerializer,
    ProjectSerializer,
    TaskSerializer,
    MilestoneSerializer,
    TimesheetStatusSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer


class AssignedTaskViewSet(viewsets.ModelViewSet):
    queryset = AssignedTask.objects.all()
    serializer_class = AssignedTaskSerializer


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer


class TimesheetStatusViewSet(viewsets.ModelViewSet):
    queryset = TimesheetStatus.objects.all()
    serializer_class = TimesheetStatusSerializer
