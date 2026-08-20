from django.contrib import admin

from .models import AssignedTask, Milestone, Project, Task


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'quotation', 'system_name', 'customer_name', 'customer_code']
    search_fields = ['name', 'quotation']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'milestone']
    search_fields = ['name']


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'project']
    search_fields = ['name']


@admin.register(AssignedTask)
class AssignedTaskAdmin(admin.ModelAdmin):
    list_display = ['task_obj', 'project_obj', 'assign_by', 'assign_to', 'start_date', 'end_date', 'created_date']
    search_fields = ['task_obj__name', 'project_obj__name']
    list_filter = ['project_obj', 'start_date', 'end_date']
    raw_id_fields = ['project_obj', 'task_obj', 'milestone_obj']

