from django.urls import include, path
from rest_framework import routers

from .views import (
    SubmissionViewSet,
    TimesheetStatusViewSet,
    TimesheetEntryViewSet,
)

router = routers.DefaultRouter()
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'timesheet-statuses', TimesheetStatusViewSet, basename='timesheetstatus')

urlpatterns = [
    path('', include(router.urls)),
    path('timesheet-entries/', TimesheetEntryViewSet.as_view({'get': 'entries'}), name='timesheet-entries'),
]
