from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import AssignedTask, Submission, TimesheetStatus
from .models import Project, Task, Milestone

User = get_user_model()


class AssignedTaskSerializer(serializers.ModelSerializer):
    assign_by = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all(), allow_null=True)
    assign_to = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all(), allow_null=True)

    project_obj = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), required=False, allow_null=True)
    task_obj = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all(), required=False, allow_null=True)
    milestone_obj = serializers.PrimaryKeyRelatedField(queryset=Milestone.objects.all(), required=False, allow_null=True)

    class Meta:
        model = AssignedTask
        fields = [
            'id', 'assign_by', 'assign_to', 'project_obj', 'task_obj', 'milestone_obj',
            'start_date', 'end_date', 'created_date', 'updated_date',
        ]


class SubmissionSerializer(serializers.ModelSerializer):
    assignId = serializers.PrimaryKeyRelatedField(queryset=AssignedTask.objects.all())
    approvedBy = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all(), allow_null=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'assignId', 'date', 'hours', 'rate', 'status', 'rejection_reason',
            'approvedBy', 'approved_status', 'created_at', 'updated_at',
        ]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'quotation', 'system_name', 'customer_name', 'customer_code']


class TaskSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    milestone = serializers.PrimaryKeyRelatedField(queryset=Milestone.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Task
        fields = ['id', 'project', 'name', 'description', 'milestone']


class MilestoneSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())

    class Meta:
        model = Milestone
        fields = ['id', 'project', 'name']

# (querysets provided above)

class TimesheetStatusSerializer(serializers.ModelSerializer):
    uid = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    timesheet_status = serializers.ChoiceField(choices=TimesheetStatus.STATUS_CHOICES)
    unlock_status = serializers.ChoiceField(choices=TimesheetStatus.STATUS_CHOICES)

    class Meta:
        model = TimesheetStatus
        fields = [
            'id', 'uid', 'timesheet_status', 'weeknumber', 'submission_status', 'action_status',
            'weekyear', 'created_date', 'unlock_reason', 'unlock_status', 'updated_date', 'comments',
        ]
