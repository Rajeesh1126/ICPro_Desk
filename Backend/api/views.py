from django.db.models import Prefetch, Q, F, Value, BooleanField
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

from collections import defaultdict
# from django.core.cache import cache
from django.db.models.functions import (
    Coalesce,
    ExtractWeek,
    ExtractYear,
)
from rest_framework import status

# Import your existing function
# from .utils import getApprovalStatusFromCache

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
    def get_timesheet_status( employee_id, week_number, week_year ):

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

class WeeklyTimesheetStatusAPIView(APIView):

    permission_classes = [IsAuthenticated]

    # =========================================================
    # CURRENT WEEK DETAILS
    # =========================================================

    def get_current_week_details(self):

        current_date = timezone.localtime()

        # Monday
        week_start_date = (
            current_date
            - timedelta(days=current_date.weekday())
        )

        # Sunday
        week_end_date = (
            week_start_date
            + timedelta(days=6)
        )

        # ISO year/week
        iso_year, iso_week, _ = (
            week_start_date.isocalendar()
        )

        # Show current week + previous 8 weeks
        if iso_week <= 8:

            selected_week_start = 1
            selected_week_end = 8

        else:

            selected_week_start = (
                iso_week - 8
            )

            selected_week_end = iso_week

        return {
            "current_date": current_date,

            "current_year": iso_year,

            "current_week": iso_week,

            "week_start": selected_week_start,

            "week_end": selected_week_end,

            "week_start_date": week_start_date,

            "week_end_date": week_end_date,
        }

    # =========================================================
    # REQUEST PARAMETERS
    # =========================================================

    def get_parameters(self, request):

        current = (
            self.get_current_week_details()
        )

        selected_year = current[
            "current_year"
        ]

        selected_week_start = current[
            "week_start"
        ]

        selected_week_end = current[
            "week_end"
        ]

        selected_employee = ""

        employee_status = True

        # GET -> query params
        # POST -> request body
        if request.method == "POST":

            data = request.data

        else:

            data = request.query_params

        # -----------------------------------------------------
        # Year
        # -----------------------------------------------------

        try:

            selected_year = int(
                data.get(
                    "weekYear",
                    selected_year
                )
            )

        except (
            TypeError,
            ValueError
        ):

            selected_year = current[
                "current_year"
            ]

        # -----------------------------------------------------
        # Week Start
        # -----------------------------------------------------

        try:

            selected_week_start = int(
                data.get(
                    "weekStart",
                    selected_week_start
                )
            )

        except (
            TypeError,
            ValueError
        ):

            selected_week_start = current[
                "week_start"
            ]

        # -----------------------------------------------------
        # Week End
        # -----------------------------------------------------

        try:

            selected_week_end = int(
                data.get(
                    "weekEnd",
                    selected_week_end
                )
            )

        except (
            TypeError,
            ValueError
        ):

            selected_week_end = current[
                "week_end"
            ]

        # -----------------------------------------------------
        # Employee
        # -----------------------------------------------------

        selected_employee = data.get(
            "employeeId",
            ""
        )

        # -----------------------------------------------------
        # Active / Inactive
        # -----------------------------------------------------

        employee_status = data.get(
            "selectedEmpStatus",
            True
        )

        if isinstance(
            employee_status,
            str
        ):

            employee_status = (
                employee_status.lower()
                == "true"
            )

        else:

            employee_status = bool(
                employee_status
            )

        # -----------------------------------------------------
        # Validate week range
        # -----------------------------------------------------

        if selected_week_start < 1:

            selected_week_start = 1

        if selected_week_end > 53:

            selected_week_end = 53

        if (
            selected_week_start
            > selected_week_end
        ):

            selected_week_start = (
                selected_week_end
            )

        return {
            "selected_year":
                selected_year,

            "selected_week_start":
                selected_week_start,

            "selected_week_end":
                selected_week_end,

            "selected_employee":
                selected_employee,

            "employee_status":
                employee_status,
        }

    # =========================================================
    # APPROVAL STATUS
    # =========================================================

    def get_approval_status(
        self,
        task_status_lookup,
        user_id,
        weeknumber,
        year
    ):

        key = (
            user_id,
            weeknumber,
            year
        )

        task_items = (
            task_status_lookup.get(
                key,
                []
            )
        )

        # No submissions
        if not task_items:

            return "notsubmitted"

        statuses = [
            item.get("status")
            for item in task_items
        ]

        approved_statuses = [
            item.get("approved_status")
            for item in task_items
        ]

        # -----------------------------------------------------
        # Rejected / incomplete
        # -----------------------------------------------------

        if (
            "Rejected" in statuses
            or None in statuses
        ):

            return "notsubmitted"

        # -----------------------------------------------------
        # All tasks accepted
        # -----------------------------------------------------

        if (
            len(set(statuses)) == 1
            and statuses[0] == "Accepted"
        ):

            # Approved on time
            if 1 in approved_statuses:

                return "ontime"

            # Approved but delayed
            return "delayedapproval"

        # -----------------------------------------------------
        # Nothing accepted
        # -----------------------------------------------------

        if all(
            value != "Accepted"
            for value in statuses
        ):

            return "approvalpending"

        # -----------------------------------------------------
        # Mixed status
        # -----------------------------------------------------

        return "missed"

    # =========================================================
    # GET EMPLOYEES
    # =========================================================

    def get_employees(
        self,
        employee_status,
        selected_employee=None
    ):

        filters = {
            "is_active": employee_status
        }

        # Employee selected
        if selected_employee:

            filters["id"] = selected_employee

        queryset = (
            User.objects

            # -------------------------------------------------
            # UserProfile contains role
            # -------------------------------------------------

            .filter(
                Q(
                    profile__role__permissions__codename__in=[
                        "view_submission",
                        "view_approval",
                    ]
                ),
                **filters
            )

            # -------------------------------------------------
            # User fields
            # -------------------------------------------------

            .annotate(

                joinedWeek=ExtractWeek(
                    "date_joined"
                ),

                joinedYear=ExtractYear(
                    "date_joined"
                ),

                resignedWeek=ExtractWeek(
                    "profile__resign_date"
                ),

                resignedYear=ExtractYear(
                    "profile__resign_date"
                ),
            )

            # -------------------------------------------------
            # Values
            # -------------------------------------------------

            .values(
                "id",
                "first_name",

                "profile__reporting_to",

                "joinedWeek",
                "joinedYear",

                "resignedWeek",
                "resignedYear",
            )

            .order_by("id")

            .distinct()
        )

        return list(queryset)

    # =========================================================
    # TIMESHEET STATUS LOOKUP
    # =========================================================

    def get_timesheet_statuses(
        self,
        selected_year,
        week_start,
        week_end,
        employee_status,
        employee_ids=None
    ):

        filters = {

            "weekyear":
                selected_year,

            "weeknumber__range": [
                week_start,
                week_end,
            ],

            "uid__is_active":
                employee_status,
        }

        # Only selected employees
        if employee_ids:

            filters[
                "uid__in"
            ] = employee_ids

        queryset = (
            TimesheetStatus.objects

            .annotate(

                submissionStatus=Coalesce(
                    F("submission_status"),
                    Value(False),
                    output_field=BooleanField(),
                ),

                actionStatus=Coalesce(
                    F("action_status"),
                    Value(False),
                    output_field=BooleanField(),
                ),

                timesheetStatus=F(
                    "timesheet_status"
                ),

                weekNumber=F(
                    "weeknumber"
                ),

                weekYear=Coalesce(
                    F("weekyear"),
                    Value(selected_year),
                ),
            )

            .filter(**filters)

            .values(
                "submissionStatus",
                "actionStatus",
                "timesheetStatus",
                "weekNumber",
                "weekYear",
                "uid",
            )

            .order_by(
                "uid",
                "weeknumber"
            )
        )

        lookup = {}

        for item in queryset:

            key = (
                item["uid"],
                item["weekNumber"],
                item["weekYear"],
            )

            lookup[key] = item

        return lookup

    # =========================================================
    # SUBMISSION LOOKUP
    # =========================================================

    def get_submission_lookup(
        self,
        week_start_date,
        week_end_date,
        employee_ids=None
    ):
        """
        IMPORTANT:

        This version assumes:

            Submission.assignId -> User

        Therefore we use:

            assignId

        NOT:

            assignId__assignTo
        """

        # -----------------------------------------------------
        # Employee IDs
        # -----------------------------------------------------

        employee_ids_set = set(
            employee_ids or []
        )

        # -----------------------------------------------------
        # Submission query
        # -----------------------------------------------------

        submissions = (
            Submission.objects

            .filter(
                date__range=[
                    week_start_date,
                    week_end_date,
                ]
            )

            .values(
                "assignId",
                "date",
                "status",
                "approved_status",
            )
        )

        lookup = defaultdict(list)

        # -----------------------------------------------------
        # Build lookup
        # -----------------------------------------------------

        for item in submissions:

            user_id = item[
                "assignId"
            ]

            # -------------------------------------------------
            # Selected employee filtering
            # -------------------------------------------------

            if (
                employee_ids_set
                and user_id not in employee_ids_set
            ):

                continue

            submission_date = item[
                "date"
            ]

            # -------------------------------------------------
            # ISO week
            # -------------------------------------------------

            iso_year, iso_week, _ = (
                submission_date.isocalendar()
            )

            key = (
                user_id,
                iso_week,
                iso_year,
            )

            lookup[key].append(
                {
                    "status":
                        item["status"],

                    "approved_status":
                        item[
                            "approved_status"
                        ],
                }
            )

        return lookup

    # =========================================================
    # EMPLOYEE DROPDOWN
    # =========================================================

    def get_employee_list(
        self,
        employee_status
    ):

        return list(
            User.objects

            .filter(
                is_active=employee_status
            )

            .values(
                "id",
                "first_name",
            )

            .order_by(
                "first_name"
            )
        )

    # =========================================================
    # BUILD RESPONSE
    # =========================================================

    def build_response(
        self,
        request
    ):

        # -----------------------------------------------------
        # Current week
        # -----------------------------------------------------

        current = (
            self.get_current_week_details()
        )

        # -----------------------------------------------------
        # Request parameters
        # -----------------------------------------------------

        params = (
            self.get_parameters(
                request
            )
        )

        selected_year = params[
            "selected_year"
        ]

        selected_week_start = params[
            "selected_week_start"
        ]

        selected_week_end = params[
            "selected_week_end"
        ]

        selected_employee = params[
            "selected_employee"
        ]

        employee_status = params[
            "employee_status"
        ]

        # =====================================================
        # EMPLOYEES
        # =====================================================

        employees = (
            self.get_employees(
                employee_status,
                selected_employee
            )
        )

        employee_ids = [
            employee["id"]
            for employee in employees
        ]

        # =====================================================
        # WEEK DATES
        # =====================================================

        try:

            week_start_date = (
                datetime.fromisocalendar(
                    selected_year,
                    selected_week_start,
                    1,
                )
            )

            week_end_date = (
                datetime.fromisocalendar(
                    selected_year,
                    selected_week_end,
                    7,
                )
            )

        except ValueError:

            return Response(
                {
                    "detail":
                        "Invalid ISO week/year selected."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================================
        # TIMESHEET STATUS
        # =====================================================

        timesheet_lookup = (
            self.get_timesheet_statuses(
                selected_year,
                selected_week_start,
                selected_week_end,
                employee_status,
                employee_ids,
            )
        )

        # =====================================================
        # SUBMISSION STATUS
        # =====================================================

        task_status_lookup = (
            self.get_submission_lookup(
                week_start_date,
                week_end_date,
                employee_ids,
            )
        )

        # =====================================================
        # RESULT
        # =====================================================

        result = {}

        # -----------------------------------------------------
        # Employees
        # -----------------------------------------------------

        for employee in employees:

            employee_id = employee[
                "id"
            ]

            employee_data = {

                "first_name":
                    employee[
                        "first_name"
                    ],

                "joinedWeek":
                    employee[
                        "joinedWeek"
                    ],

                "joinedYear":
                    employee[
                        "joinedYear"
                    ],

                "resignedWeek":
                    employee[
                        "resignedWeek"
                    ],

                "resignedYear":
                    employee[
                        "resignedYear"
                    ],

                "weekYear":
                    selected_year,
            }

            # =================================================
            # Weeks
            # =================================================

            for week_number in range(
                selected_week_start,
                selected_week_end + 1
            ):

                key = (
                    employee_id,
                    week_number,
                    selected_year,
                )

                timesheet = (
                    timesheet_lookup.get(
                        key
                    )
                )

                # -------------------------------------------------
                # No TimesheetStatus
                # -------------------------------------------------

                if not timesheet:

                    # We can still return N/A
                    employee_data[
                        str(week_number)
                    ] = {

                        "action_status":
                            False,

                        "submission_status":
                            False,

                        "timesheet_status":
                            None,

                        "approval_status":
                            "notsubmitted",
                    }

                    continue

                # -------------------------------------------------
                # Approval status
                # -------------------------------------------------

                approval_status = (
                    self.get_approval_status(
                        task_status_lookup,
                        employee_id,
                        week_number,
                        selected_year,
                    )
                )

                # -------------------------------------------------
                # Week data
                # -------------------------------------------------

                employee_data[
                    str(week_number)
                ] = {

                    "action_status":
                        timesheet[
                            "actionStatus"
                        ],

                    "submission_status":
                        timesheet[
                            "submissionStatus"
                        ],

                    "timesheet_status":
                        timesheet[
                            "timesheetStatus"
                        ],

                    "approval_status":
                        approval_status,
                }

            result[
                employee_id
            ] = employee_data

        # =====================================================
        # EMPLOYEE DROPDOWN
        # =====================================================

        employee_list = (
            self.get_employee_list(
                employee_status
            )
        )

        # =====================================================
        # RESPONSE
        # =====================================================

        return Response(
            {

                # ---------------------------------------------
                # Main table
                # ---------------------------------------------

                "employees":
                    result,

                # ---------------------------------------------
                # Current values
                # ---------------------------------------------

                "year":
                    current[
                        "current_year"
                    ],

                "current_week":
                    current[
                        "current_week"
                    ],

                # ---------------------------------------------
                # Dropdown defaults
                # ---------------------------------------------

                "DropDownWeekStart":
                    current[
                        "week_start"
                    ],

                "DropDownWeekEnd":
                    current[
                        "week_end"
                    ],

                # ---------------------------------------------
                # Employee dropdown
                # ---------------------------------------------

                "employeeList":
                    employee_list,

                # ---------------------------------------------
                # Selected values
                # ---------------------------------------------

                "selectedYear":
                    selected_year,

                "selectedWeekStart":
                    selected_week_start,

                "selectedWeekEnd":
                    selected_week_end,

                "selectedEmployee":
                    selected_employee,

                "selectedEmpStatus":
                    employee_status,
            },

            status=status.HTTP_200_OK
        )

    # =========================================================
    # GET
    # =========================================================

    def get(
        self,
        request
    ):

        return self.build_response(
            request
        )

    # =========================================================
    # POST
    # =========================================================

    def post(
        self,
        request
    ):

        return self.build_response(
            request
        )