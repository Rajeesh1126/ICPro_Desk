from rest_framework import serializers
from django.contrib.auth import get_user_model

from projects.models import AssignedTask, Project
from tickets.models import Ticket
from .models import Submission, TimesheetStatus

User = get_user_model()


class SubmissionSerializer(serializers.ModelSerializer):
    assignId = serializers.PrimaryKeyRelatedField(queryset=AssignedTask.objects.all())
    approvedBy = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all(), allow_null=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'assignId', 'date', 'hours', 'rate', 'status', 'rejection_reason',
            'approvedBy', 'approved_status', 'created_at', 'updated_at',
        ]


class TimesheetDraftEntrySerializer(serializers.Serializer):
    assignId = serializers.PrimaryKeyRelatedField(queryset=AssignedTask.objects.all())
    date = serializers.DateField()
    hours = serializers.IntegerField(min_value=0)
    rate = serializers.IntegerField(min_value=0, required=False, default=0)


class TimesheetDraftSerializer(serializers.Serializer):
    entries = TimesheetDraftEntrySerializer(many=True, allow_empty=True)

    def validate_entries(self, entries):
        request = self.context['request']

        for entry in entries:
            if entry['assignId'].assign_to_id != request.user.id:
                raise serializers.ValidationError(
                    f"Assigned task {entry['assignId'].id} is not assigned to the current user."
                )

            if entry['hours'] > 0 and not entry['assignId'].assign_by_id:
                raise serializers.ValidationError(
                    f"Budget owner is required for assigned task {entry['assignId'].id}."
                )

        return entries


class TimesheetSubmitSerializer(TimesheetDraftSerializer):
    week_start = serializers.DateField()
    comments = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
        allow_null=True,
    )


class TimesheetUnlockRequestSerializer(serializers.Serializer):
    week_start = serializers.DateField()
    unlock_reason = serializers.CharField(max_length=1000)


class TimesheetAssignTicketsSerializer(serializers.Serializer):
    ticket_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Ticket.objects.all()),
        allow_empty=False,
    )

    def validate_ticket_ids(self, tickets):
        for ticket in tickets:
            if ticket.current_status in {'open', 'closed'}:
                raise serializers.ValidationError(
                    f"Ticket {ticket.number} cannot be assigned from status {ticket.current_status}."
                )

        return tickets


class TimesheetAssignProjectSerializer(serializers.Serializer):
    project_id = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())


class TimesheetExtendTasksSerializer(serializers.Serializer):
    assigned_task_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=AssignedTask.objects.all()),
        allow_empty=False,
    )
    end_date = serializers.DateField()

    def validate_assigned_task_ids(self, assigned_tasks):
        request = self.context['request']

        for assigned_task in assigned_tasks:
            if assigned_task.assign_to_id != request.user.id:
                raise serializers.ValidationError(
                    f"Assigned task {assigned_task.id} is not assigned to the current user."
                )

        return assigned_tasks


class TimesheetRemoveTasksSerializer(serializers.Serializer):
    assigned_task_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=AssignedTask.objects.all()),
        allow_empty=False,
    )
    week_start = serializers.DateField()

    def validate_assigned_task_ids(self, assigned_tasks):
        request = self.context['request']

        for assigned_task in assigned_tasks:
            if assigned_task.assign_to_id != request.user.id:
                raise serializers.ValidationError(
                    f"Assigned task {assigned_task.id} is not assigned to the current user."
                )

        return assigned_tasks


class ApprovalActionSerializer(serializers.Serializer):
    weekStart = serializers.DateField()
    employeeId = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    assignId = serializers.PrimaryKeyRelatedField(queryset=AssignedTask.objects.all())
    action = serializers.ChoiceField(choices=['Accepted', 'Rejected'])
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comments = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
        allow_null=True,
    )




# (querysets provided above)
class TimesheetStatusSerializer(serializers.ModelSerializer):
    uid = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    first_name = serializers.SerializerMethodField()
    timesheet_status = serializers.ChoiceField(choices=TimesheetStatus.STATUS_CHOICES)
    # unlock_status = serializers.ChoiceField(choices=TimesheetStatus.STATUS_CHOICES)

    class Meta:
        model = TimesheetStatus
        fields = [
            'id', 'uid', 'first_name', 'timesheet_status', 'weeknumber', 'submission_status', 'action_status',
            'weekyear', 'created_date', 'unlock_reason',  'updated_date', 'comments',
        ]

    def get_first_name(self, obj):
        return obj.uid.get_full_name() or obj.uid.username
