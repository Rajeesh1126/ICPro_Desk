from django.urls import include, path
from rest_framework import routers

from .views import (
    ApprovalDetailDataViewSet,
    SubmissionViewSet,
    TimesheetStatusViewSet,
    TimesheetEntryViewSet,
    TimesheetApprovalViewSet,
)

router = routers.DefaultRouter()
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'timesheet-statuses', TimesheetStatusViewSet, basename='timesheetstatus')
router.register(r'approvals', TimesheetApprovalViewSet, basename='approval')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'ApprovalDetailData/',
        ApprovalDetailDataViewSet.as_view({'get': 'list', 'patch': 'partial_update'}),
        name='approval-detail-data',
    ),
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
        'timesheet-entries/ticket-options/',
        TimesheetEntryViewSet.as_view({'get': 'ticket_options'}),
        name='timesheet-entries-ticket-options',
    ),
    path(
        'timesheet-entries/assign-tickets/',
        TimesheetEntryViewSet.as_view({'post': 'assign_tickets'}),
        name='timesheet-entries-assign-tickets',
    ),
    path(
        'timesheet-entries/assign-project/',
        TimesheetEntryViewSet.as_view({'post': 'assign_project'}),
        name='timesheet-entries-assign-project',
    ),
]
