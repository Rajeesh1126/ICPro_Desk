from django.contrib import admin
from .models import Submission, TimesheetStatus


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['assignId', 'date', 'hours', 'approved_status', 'approvedBy']
    search_fields = ['assignId__task_obj__name', 'assignId__project_obj__code']
    list_filter = ['approved_status', 'date']


@admin.register(TimesheetStatus)
class TimesheetStatusAdmin(admin.ModelAdmin):
    list_display = [
        'uid',
        'timesheet_status',
        'weeknumber',
        'weekyear',
        'submission_status',
        'action_status',
        'created_date',
        'updated_date',
    ]
    search_fields = [
        'uid__username',
        'uid__first_name',
        'uid__last_name',
        'unlock_reason',
        'comments',
    ]
    list_filter = [
        'timesheet_status',
        'submission_status',
        'action_status',
        'weekyear',
        'weeknumber',
    ]
    readonly_fields = ['created_date', 'updated_date']
