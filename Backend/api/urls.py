from django.urls import include, path
from rest_framework import routers

from .views import (
    SubmissionViewSet,
    TimesheetStatusViewSet,
    TimesheetEntryViewSet,
    ApprovalViewSet,
    ApprovalDetailData,
    WeeklyTimesheetStatusAPIView
)

router = routers.DefaultRouter()
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'timesheet-statuses', TimesheetStatusViewSet, basename='timesheetstatus')
router.register(r"approvals",ApprovalViewSet,basename="approvals")

urlpatterns = [
    path('', include(router.urls)),
    path('timesheet-entries/', TimesheetEntryViewSet.as_view({'get': 'entries'}), name='timesheet-entries'),
    path(
        'timesheet-entries/save-draft/',
        TimesheetEntryViewSet.as_view({'post': 'save_draft'}),
        name='timesheet-entries-save-draft',
    ),
    path(
        'timesheet-entries/submit/',
        TimesheetEntryViewSet.as_view({'post': 'submit'}),
        name='timesheet-entries-submit',
    ),
    path(
        'timesheet-entries/extend-tasks/',
        TimesheetEntryViewSet.as_view({'post': 'extend_tasks'}),
        name='timesheet-entries-extend-tasks',
    ),
    path(
        'timesheet-entries/remove-tasks/',
        TimesheetEntryViewSet.as_view({'post': 'remove_tasks'}),
        name='timesheet-entries-remove-tasks',
    ),
    path(
        "ApprovalDetailData/",
        ApprovalDetailData.as_view(),
        name="ApprovalDetailData"
    ),
    path(
        "weekly-timesheet-status/",
        WeeklyTimesheetStatusAPIView.as_view(),
        name="weekly-timesheet-status",
    ),
]
