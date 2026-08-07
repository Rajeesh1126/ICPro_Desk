from django.contrib import admin
from .models import AssignedTask, Submission, Project, Task, Milestone


@admin.register(AssignedTask)
class AssignedTaskAdmin(admin.ModelAdmin):
    list_display = ['task_obj', 'project_obj', 'assign_by', 'assign_to', 'start_date', 'end_date', 'created_date']
    search_fields = ['task_obj__name', 'project_obj__name']
    list_filter = ['project_obj', 'start_date', 'end_date']
    raw_id_fields = ['project_obj', 'task_obj', 'milestone_obj']


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['assignId', 'date', 'hours', 'approved_status', 'approvedBy']
    search_fields = ['assignId__task_name', 'assignId__project_name']
    list_filter = ['approved_status', 'date']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name','quotation', 'system_name', 'customer_name', 'customer_code']
    search_fields = ['name', 'quotation']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'project','milestone']
    search_fields = ['name']


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'project']
    search_fields = ['name']
