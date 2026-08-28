from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Sum
from projects.models import AssignedTask
from .models import Submission, TimesheetStatus
from django.utils import timezone
from datetime import date, timedelta

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

        return entries


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

# (querysets provided above)
class TimesheetStatusSerializer(serializers.ModelSerializer):
    uid = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    first_name = serializers.CharField(
        source="uid.first_name",
        read_only=True
    )
    timesheet_status = serializers.ChoiceField(choices=TimesheetStatus.STATUS_CHOICES)

    class Meta:
        model = TimesheetStatus
        fields = [
            'id', 'uid','first_name' , 'timesheet_status', 'weeknumber', 'submission_status', 'action_status',
            'weekyear', 'created_date', 'unlock_reason', 'updated_date', 'comments',
        ]

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

class ApprovalSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    name = serializers.SerializerMethodField()
    reporting_to = serializers.SerializerMethodField()
    hours = serializers.SerializerMethodField()
    overview = serializers.SerializerMethodField()
    submission_status = serializers.SerializerMethodField()
    approval_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "reporting_to",
            "hours",
            "overview",
            "submission_status",
            "approval_status",
        ]
    def get_selected_week(self):
        """
        Reads weekStart from request query parameters.

        Example:
        /api/approvals/?weekStart=2026-08-24

        Returns:
        (
            weeknumber,
            weekyear,
            week_start,
            week_end
        )
        """

        if hasattr(self, "_selected_week"):
            return self._selected_week

        request = self.context.get("request")

        today = timezone.localdate()

        week_start_param = None

        if request:
            week_start_param = request.query_params.get("weekStart")
        if week_start_param:
            try:
                week_start = date.fromisoformat(week_start_param)

            except (ValueError, TypeError):
                # Invalid date -> use current week
                weekyear, weeknumber, weekday = today.isocalendar()

                week_start = date.fromisocalendar(
                    weekyear,
                    weeknumber,
                    1,
                )
        else:
            weekyear, weeknumber, weekday = today.isocalendar()

            week_start = date.fromisocalendar(
                weekyear,
                weeknumber,
                1,
            )
        week_end = week_start + timedelta(days=6)
        weekyear, weeknumber, _ = week_start.isocalendar()

        self._selected_week = (
            weeknumber,
            weekyear,
            week_start,
            week_end,
        )

        return self._selected_week
    def get_timesheet_status(self, obj):
        """
        Get TimesheetStatus for the selected user and week.
        """

        cache_key = f"_timesheet_status_{obj.pk}"

        if hasattr(self, cache_key):
            return getattr(self, cache_key)

        weeknumber, weekyear, _, _ = self.get_selected_week()

        status = (
            TimesheetStatus.objects
            .filter(
                uid=obj,
                weeknumber=weeknumber,
                weekyear=weekyear,
            )
            .first()
        )

        setattr(self, cache_key, status)

        return status
    def get_name(self, obj):
        full_name = (
            f"{obj.first_name} {obj.last_name}"
        ).strip()

        return full_name or obj.username
    def get_reporting_to(self, obj):
        profile = getattr(obj, "profile", None)

        if not profile or not profile.reporting_to:
            return ""

        reporting_user = profile.reporting_to

        full_name = (
            f"{reporting_user.first_name} "
            f"{reporting_user.last_name}"
        ).strip()

        return full_name or reporting_user.username
    def get_hours(self, obj):
        """
        Get total submission hours for the selected week.
        """

        _, _, week_start, week_end = self.get_selected_week()

        submissions = Submission.objects.filter(
            assignId__assign_to_id=obj.id,
            date__gte=week_start,
            date__lte=week_end,
        )

        total_hours = submissions.aggregate(
            total_hours=Sum("hours")
        ).get("total_hours")

        return total_hours or 0
    def get_overview(self, obj):
        status = self.get_timesheet_status(obj)

        if not status:
            return "Not Submitted"
        status_map = {
            "Accepted": "Accepted",
            "Rejected": "Rejected",
            "Requested": "Requested",
            "Unlocked": "Unlocked",
            "Submitted": "Submitted",
            "Unlock Rejected": "Unlock Rejected"
        }

        if status.timesheet_status in status_map:
            return status_map[status.timesheet_status]

        return "Not Submitted"
    def get_submission_status(self, obj):
        status = self.get_timesheet_status(obj)

        today = timezone.localdate()

        _, _, _, week_end = self.get_selected_week()
        if status and status.submission_status:
            return "OnTime"
        if today > week_end:
            return "Delayed"
        return f"Due by {week_end:%d-%b-%Y}"
    def get_approval_status(self, obj):
        status = self.get_timesheet_status(obj)

        today = timezone.localdate()

        _, _, _, week_end = self.get_selected_week()

        if status and status.action_status:
            return "OnTime"
        if today > week_end:
            return "Delayed"
        return f"Due by {week_end:%d-%b-%Y}"