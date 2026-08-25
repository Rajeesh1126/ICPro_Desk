from django.contrib import admin
from .models import Submission


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['assignId', 'date', 'hours', 'approved_status', 'approvedBy']
    search_fields = ['assignId__task_obj__name', 'assignId__project_obj__name']
    list_filter = ['approved_status', 'date']
