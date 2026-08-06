from django.urls import include, path
from rest_framework import routers

from .views import (
    AssignedTaskViewSet,
    SubmissionViewSet,
    ProjectViewSet,
    TaskViewSet,
    MilestoneViewSet,
    TimesheetStatusViewSet,
)

router = routers.DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'assigned-tasks', AssignedTaskViewSet, basename='assignedtask')
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'timesheet-statuses', TimesheetStatusViewSet, basename='timesheetstatus')

urlpatterns = [
    path('', include(router.urls)),
]
