from django.urls import include, path
from rest_framework import routers

from .views import AssignedTaskViewSet, MilestoneViewSet, PhaseViewSet, ProjectViewSet, TaskViewSet

router = routers.DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'phases', PhaseViewSet, basename='phase')
router.register(r'assigned-tasks', AssignedTaskViewSet, basename='assignedtask')

urlpatterns = [
    path('', include(router.urls)),
]
