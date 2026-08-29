from django.db.models import Prefetch, Q
from django.utils.dateparse import parse_date
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import RoleBasedPermission
from projects.models import AssignedTask, Milestone, Project, Task
from .models import Submission, TimesheetStatus
from projects.models import AssignedTask
from django.contrib.auth import get_user_model
from datetime import date, datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from .serializers import (
    SubmissionSerializer,
    TimesheetDraftSerializer,
    TimesheetExtendTasksSerializer,
    TimesheetRemoveTasksSerializer,
    TimesheetStatusSerializer,
    ApprovalSerializer
)

User = get_user_model()
class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [RoleBasedPermission]

class TimesheetStatusViewSet(viewsets.ModelViewSet):
    serializer_class = TimesheetStatusSerializer
    permission_classes = [RoleBasedPermission]

    def get_queryset(self):
        queryset = TimesheetStatus.objects.select_related("uid")

        week_start_param = self.request.query_params.get("weekStart")
        timesheet_status = self.request.query_params.get(
            "timesheetstatus"
        )

        # Filter by weekStart
        if week_start_param:
            try:
                week_start = date.fromisoformat(
                    week_start_param
                )

                weekyear, weeknumber, _ = (
                    week_start.isocalendar()
                )

                queryset = queryset.filter(
                    weeknumber=weeknumber,
                    weekyear=weekyear,
                )

            except ValueError:
                return queryset.none()

        # Filter by timesheet status
        if timesheet_status:
            queryset = queryset.filter(
                timesheet_status__iexact=timesheet_status
            )

        return queryset

class TimesheetEntryViewSet(viewsets.ViewSet):
    permission_classes = [RoleBasedPermission]

    def _ensure_other_activity_assignments(self, user):
        others_project = Project.objects.filter(name__iexact='Others').first()
        if not others_project:
            return

        other_tasks = Task.objects.filter(project=others_project).select_related('milestone')
        for task in other_tasks:
            AssignedTask.objects.get_or_create(
                assign_to=user,
                project_obj=others_project,
                task_obj=task,
                milestone_obj=task.milestone,
                defaults={
                    'assign_by': None,
                },
            )

    def _save_entries(self, entries, entry_status):
        saved_entries = []
        deleted_entries = []

        for entry in entries:
            if entry['hours'] == 0:
                deleted_count, _ = Submission.objects.filter(
                    assignId=entry['assignId'],
                    date=entry['date'],
                ).delete()

                if deleted_count:
                    deleted_entries.append({
                        'assignId': entry['assignId'].id,
                        'date': entry['date'].strftime('%Y-%m-%d'),
                    })

                continue

            submission, _ = Submission.objects.update_or_create(
                assignId=entry['assignId'],
                date=entry['date'],
                defaults={
                    'hours': entry['hours'],
                    'rate': entry.get('rate', 0),
                    'status': entry_status,
                    'approved_status': False,
                },
            )
            saved_entries.append({
                'id': submission.id,
                'assignId': submission.assignId_id,
                'date': submission.date.strftime('%Y-%m-%d'),
                'hours': submission.hours,
                'rate': submission.rate,
                'status': submission.status,
            })

        return saved_entries, deleted_entries

    @action(detail=False, methods=['get'], url_path='entries')
    def entries(self, request):
        week_start = parse_date(request.query_params.get('week_start', ''))
        week_end = None
        if week_start:
            week_end = week_start + timedelta(days=6)

        self._ensure_other_activity_assignments(request.user)

        assigned_task_filters = Q(assign_to=request.user)
        if week_start and week_end:
            assigned_task_filters &= (
                Q(end_date__isnull=True) | Q(end_date__gte=week_start)
            ) & (
                Q(start_date__isnull=True) | Q(start_date__lte=week_end)
            )

        assigned_tasks = AssignedTask.objects.filter(
            assigned_task_filters,
        ).select_related(
            'task_obj',
            'milestone_obj',
            'project_obj',
        ).order_by('id')

        projects = Project.objects.filter(
            milestones__assigned_tasks__in=assigned_tasks,
        ).distinct().prefetch_related(
            Prefetch(
                'milestones',
                queryset=Milestone.objects.filter(
                    assigned_tasks__in=assigned_tasks,
                ).distinct().prefetch_related(
                    Prefetch(
                        'assigned_tasks',
                        queryset=assigned_tasks,
                    )
                ),
            )
        ).order_by('id')

        projects = sorted(projects, key=lambda project: project.name.lower() == 'others')

        project_payload = []
        for project in projects:
            milestones_payload = []
            for milestone in project.milestones.all():
                assigned_tasks_payload = []
                for assigned_task in milestone.assigned_tasks.all():
                    entries = {}
                    submissions = Submission.objects.filter(assignId=assigned_task)
                    if week_start and week_end:
                        submissions = submissions.filter(date__range=(week_start, week_end))

                    for submission in submissions.order_by('date'):
                        entries[submission.date.strftime('%Y-%m-%d')] = submission.hours

                    assigned_tasks_payload.append({
                        'assign_id': assigned_task.id,
                        'assign_by': assigned_task.assign_by.username if assigned_task.assign_by else None,
                        'name': assigned_task.task_obj.name if assigned_task.task_obj else None,
                        'entries': entries,
                    })

                milestones_payload.append({
                    'id': milestone.id,
                    'name': milestone.name,
                    'assigned_tasks': assigned_tasks_payload,
                })

            project_payload.append({
                'id': project.id,
                'name': project.name,
                'description':project.description,
                'quotation_id': project.quotation_id,
                'milestones': milestones_payload,
            })

        return Response(project_payload, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='save-draft')
    def save_draft(self, request):
        serializer = TimesheetDraftSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        saved_entries, deleted_entries = self._save_entries(
            serializer.validated_data['entries'],
            'Draft',
        )

        return Response(
            {
                'message': 'Draft saved successfully.',
                'entries': saved_entries,
                'deleted_entries': deleted_entries,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='submit')
    def submit(self, request):
        serializer = TimesheetSubmitSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        week_start = serializer.validated_data['week_start']
        week_number = week_start.isocalendar()[1]
        week_year = week_start.isocalendar()[0]
        comments = serializer.validated_data.get('comments') or None

        with transaction.atomic():
            saved_entries, deleted_entries = self._save_entries(
                serializer.validated_data['entries'],
                'Submitted',
            )

            timesheet_status, _ = TimesheetStatus.objects.update_or_create(
                uid=request.user,
                weeknumber=week_number,
                weekyear=week_year,
                defaults={
                    'timesheet_status': 'Submitted',
                    'submission_status': True,
                    'comments': comments,
                },
            )

        return Response(
            {
                'message': 'Time sheet submitted successfully.',
                'entries': saved_entries,
                'deleted_entries': deleted_entries,
                'timesheet_status': TimesheetStatusSerializer(timesheet_status).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='extend-tasks')
    def extend_tasks(self, request):
        serializer = TimesheetExtendTasksSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        assigned_tasks = serializer.validated_data['assigned_task_ids']
        end_date = serializer.validated_data['end_date']

        updated_count = AssignedTask.objects.filter(
            id__in=[assigned_task.id for assigned_task in assigned_tasks],
            assign_to=request.user,
        ).update(end_date=end_date)

        return Response(
            {
                'message': 'Assigned tasks extended successfully.',
                'updated_count': updated_count,
                'end_date': end_date.strftime('%Y-%m-%d'),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='remove-tasks')
    def remove_tasks(self, request):
        serializer = TimesheetRemoveTasksSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        assigned_tasks = serializer.validated_data['assigned_task_ids']
        week_start = serializer.validated_data['week_start']
        week_end = week_start + timedelta(days=6)
        previous_week_end = week_start - timedelta(days=1)

        removed_task_ids = []
        shortened_task_ids = []
        blocked_task_ids = []

        for assigned_task in assigned_tasks:
            submissions = Submission.objects.filter(assignId=assigned_task)

            if submissions.filter(date__range=(week_start, week_end)).exists():
                blocked_task_ids.append(assigned_task.id)
                continue

            if submissions.exists():
                assigned_task.end_date = previous_week_end
                assigned_task.save(update_fields=['end_date'])
                shortened_task_ids.append(assigned_task.id)
                continue

            assigned_task_id = assigned_task.id
            assigned_task.delete()
            removed_task_ids.append(assigned_task_id)

        return Response(
            {
                'message': 'Selected tasks removed where possible.',
                'removed_task_ids': removed_task_ids,
                'shortened_task_ids': shortened_task_ids,
                'blocked_task_ids': blocked_task_ids,
                'end_date': previous_week_end.strftime('%Y-%m-%d'),
            },
            status=status.HTTP_200_OK,
        )

class ApprovalViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ApprovalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            User.objects
            .select_related(
                "profile",
                "profile__reporting_to",
            )
            .filter(is_active=True)
        )

class ApprovalDetailData(APIView):
    permission_classes = [IsAuthenticated]

    @staticmethod
    def parse_week_start(week_start):
        """
        Convert YYYY-MM-DD to date and make sure it is Monday.
        """

        if not week_start:
            return None, Response(
                {
                    "error": "weekStart is required"
                },
                status=400
            )

        try:
            week_start_date = datetime.strptime(
                week_start,
                "%Y-%m-%d"
            ).date()

        except ValueError:
            return None, Response(
                {
                    "error": (
                        "weekStart must be in "
                        "YYYY-MM-DD format"
                    )
                },
                status=400
            )

        if week_start_date.weekday() != 0:
            return None, Response(
                {
                    "error": "weekStart must be a Monday"
                },
                status=400
            )

        return week_start_date, None

    @staticmethod
    def get_week_info(week_start_date):
        """
        Returns:
            week_end_date
            approval_end_date
            week_number
            week_year
        """

        week_end_date = (
            week_start_date + timedelta(days=6)
        )

        approval_end_date = (
            week_start_date + timedelta(days=13)
        )

        iso_calendar = (
            week_start_date.isocalendar()
        )

        week_number = iso_calendar.week
        week_year = iso_calendar.year

        return (
            week_end_date,
            approval_end_date,
            week_number,
            week_year,
        )

    @staticmethod
    def get_employee(employee_id):
        """
        Get employee safely.
        """

        if not employee_id:
            return None, Response(
                {
                    "error": "employeeId is required"
                },
                status=400
            )

        try:
            employee_id = int(employee_id)

        except (TypeError, ValueError):
            return None, Response(
                {
                    "error": "employeeId must be a number"
                },
                status=400
            )

        try:
            employee = User.objects.get(
                id=employee_id
            )

        except User.DoesNotExist:
            return None, Response(
                {
                    "error": "Employee not found"
                },
                status=404
            )

        return employee, None

    @staticmethod
    def get_timesheet_status(
        employee_id,
        week_number,
        week_year
    ):
        """
        IMPORTANT:
        uid is assumed to be a ForeignKey to User.

        Therefore use uid_id instead of:
            uid=employee.username
        """

        return (
            TimesheetStatus.objects
            .filter(
                uid_id=employee_id,
                weeknumber=week_number,
                weekyear=week_year,
            )
            .first()
        )

    def get(self, request):

        week_start = request.query_params.get(
            "weekStart"
        )

        employee_id = request.query_params.get(
            "employeeId"
        )
        week_start_date, error_response = (
            self.parse_week_start(
                week_start
            )
        )

        if error_response:
            return error_response

        employee, error_response = (
            self.get_employee(
                employee_id
            )
        )

        if error_response:
            return error_response

        # Convert to integer after validation.
        employee_id = employee.id

        (
            week_end_date,
            approval_end_date,
            week_number,
            week_year,
        ) = self.get_week_info(
            week_start_date
        )

        timesheet_status = (
            self.get_timesheet_status(
                employee_id,
                week_number,
                week_year
            )
        )

        comments = ""

        action_status = False

        if timesheet_status:

            comments = (
                timesheet_status.comments
                or ""
            )

            action_status = bool(
                timesheet_status.action_status
            )

        submissions = (
            Submission.objects
            .filter(
                assignId__assign_to_id=employee_id,
                date__range=[
                    week_start_date,
                    week_end_date
                ]
            )
            .select_related(
                "assignId",
                "assignId__assign_by",
                "assignId__project_obj",
                "assignId__task_obj",
                "assignId__milestone_obj",
            )
            .order_by(
                "assignId_id",
                "date"
            )
        )

        task_map = {}

        for submission in submissions:

            assigned_task = submission.assignId

            if not assigned_task:
                continue

            task_id = assigned_task.id

            if task_id not in task_map:

                task_map[task_id] = {
                    "assigned_task": assigned_task,
                    "submissions": [],
                }

            task_map[task_id][
                "submissions"
            ].append(
                submission
            )

        rows = []

        for task_id, task_data in task_map.items():

            assigned_task = (
                task_data["assigned_task"]
            )

            task_submissions = (
                task_data["submissions"]
            )

            project = (
                assigned_task.project_obj
            )

            project_id = (
                project.id
                if project
                else None
            )

            project_name = (
                project.name
                if project
                else ""
            )

            task_name = ""

            if assigned_task.milestone_obj:

                task_name = str(
                    assigned_task.milestone_obj
                )

            elif assigned_task.task_obj:

                task_name = str(
                    assigned_task.task_obj
                )

            budget_owner = ""

            if assigned_task.assign_by:

                budget_owner = (
                    assigned_task.assign_by.get_full_name()
                    or assigned_task.assign_by.username
                )

            hours = [
                "",
                "",
                "",
                "",
                "",
                "",
                "",
            ]

            rating = ""

            status = ""

            approved_status = False

            rejection_reason = None

            for submission in task_submissions:

                day_index = (
                    submission.date
                    - week_start_date
                ).days

                if (
                    day_index < 0
                    or day_index > 6
                ):
                    continue

                if submission.hours is not None:

                    hours[day_index] = (
                        f"{submission.hours:02d}.00"
                    )

                if submission.rate is not None:

                    rating = str(
                        submission.rate
                    )

                if submission.status:

                    status = (
                        submission.status
                    )


                if submission.approved_status:

                    approved_status = True

                if submission.rejection_reason:

                    rejection_reason = (
                        submission.rejection_reason
                    )

            rows.append(
                {
                    "id": assigned_task.id,
                    "projectId": project_id,
                    "project": project_name,
                    "task": task_name,
                    "budgetOwner": budget_owner,
                    "hours": hours,
                    "rating": rating,
                    "status": status,
                    "approvedStatus": approved_status,
                    "rejectionReason": rejection_reason,
                }
            )

        return Response(
            {
                "rows": rows,
                "comments": comments,
                "action_status": action_status,
            },
            status=200
        )

    def patch(self, request):

        week_start = request.data.get(
            "weekStart"
        )

        employee_id = request.data.get(
            "employeeId"
        )

        assign_id = request.data.get(
            "assignId"
        )

        action = request.data.get(
            "action"
        )

        rating = request.data.get(
            "rating"
        )

        comments = request.data.get(
            "comments"
        )

        if action not in [
            "Accepted",
            "Rejected"
        ]:
            return Response(
                {
                    "error": (
                        "action must be "
                        "Accepted or Rejected"
                    )
                },
                status=400
            )

        if rating in [
            None,
            "",
            "0",
            0
        ]:
            return Response(
                {
                    "error": "rating is required"
                },
                status=400
            )

        try:

            rating = int(rating)

        except (
            TypeError,
            ValueError
        ):

            return Response(
                {
                    "error": (
                        "rating must be a number"
                    )
                },
                status=400
            )

        if rating < 1 or rating > 5:

            return Response(
                {
                    "error": (
                        "rating must be "
                        "between 1 and 5"
                    )
                },
                status=400
            )

        if not assign_id:

            return Response(
                {
                    "error": "assignId is required"
                },
                status=400
            )

        try:

            assign_id = int(assign_id)

        except (
            TypeError,
            ValueError
        ):

            return Response(
                {
                    "error": (
                        "assignId must be a number"
                    )
                },
                status=400
            )

        week_start_date, error_response = (
            self.parse_week_start(
                week_start
            )
        )

        if error_response:
            return error_response

        employee, error_response = (
            self.get_employee(
                employee_id
            )
        )

        if error_response:
            return error_response

        employee_id = employee.id

        (
            week_end_date,
            approval_end_date,
            week_number,
            week_year,
        ) = self.get_week_info(
            week_start_date
        )

        current_date = (
            timezone.localdate()
        )

        is_delayed = (
            current_date > approval_end_date
        )

        action_status_value = (
            not is_delayed
        )

        submissions = (
            Submission.objects
            .filter(
                assignId_id=assign_id,
                assignId__assign_to_id=employee_id,
                date__range=[
                    week_start_date,
                    week_end_date
                ]
            )
        )

        if not submissions.exists():

            return Response(
                {
                    "error": (
                        "No submission records "
                        "found for the selected "
                        "employee, task and week"
                    )
                },
                status=404
            )

        with transaction.atomic():

            updated_count = (
                submissions.update(
                    status=action,
                    rate=rating
                )
            )

            timesheet_status = (
                self.get_timesheet_status(
                    employee_id,
                    week_number,
                    week_year
                )
            )

            if not timesheet_status:

                return Response(
                    {
                        "error": (
                            "Timesheet status "
                            "record not found"
                        )
                    },
                    status=404
                )

            timesheet_status.action_status = (
                action_status_value
            )

            update_fields = [
                "action_status"
            ]

            if comments is not None:

                timesheet_status.comments = (
                    comments
                )

                update_fields.append(
                    "comments"
                )

            timesheet_status.save(
                update_fields=update_fields
            )

        return Response(
            {
                "message": (
                    f"Submission records "
                    f"{action.lower()} successfully"
                ),
                "weekStart": week_start,
                "weekEnd": str(
                    week_end_date
                ),
                "approvalEndDate": str(
                    approval_end_date
                ),
                "currentDate": str(
                    current_date
                ),
                "employeeId": employee_id,
                "assignId": assign_id,
                "status": action,
                "rating": rating,
                "updatedRecords": updated_count,
                "isDelayed": is_delayed,
                "action_status": (
                    action_status_value
                ),
            },
            status=200
        )