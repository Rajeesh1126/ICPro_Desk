import json
from rest_framework import viewsets
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework import status

from .models import Ticket,Ticket_File,Ticket_Log,Self_Ticket
from rest_framework.decorators import action
from django.db.models import Count, Sum, OuterRef, Subquery, DateField, F, FloatField, ExpressionWrapper, Q, DurationField, CharField, Count, Value
from django.db.models.functions import Coalesce, NullIf, Cast, Round
from .serializers import TicketSerializer,SelfTicketSerializer
from datetime import date, timedelta
from django.http import JsonResponse
from django.db.models import Exists, OuterRef
from django.contrib.auth.models import Group
# from xhtml2pdf import pisa
import logging

from drf_spectacular.utils import extend_schema

logger = logging.getLogger(__name__)

User = get_user_model()
# Get Depart ment
class DepartmentMixin:

    def get_department_ids(self):
        user = self.request.user

        groups = set(user.groups.values_list("id", flat=True))

        include_executive = (
            self.request.query_params.get("include_executive", "false").lower()
            == "true"
        )
        if include_executive:
            executive = set(
                user.executive_dept.values_list("id", flat=True)
            )
            groups |= executive

        return list(groups)

class TicketViewSet(DepartmentMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TicketSerializer

    def get_queryset(self):
        try:
            department_ids = self.get_department_ids()
            submission_qs = Submission.objects.filter(
                assignid__quotation=OuterRef("number")
            )

            log_qs = Ticket_Log.objects.filter(
                ticket=OuterRef("pk")
            )

            return (
                Ticket.objects
                .filter(
                    Q(creator=self.request.user) |
                    Q(department__in=department_ids)
                )
                .select_related(
                    "creator",
                    "assigned_to",
                    "department",
                )
                .prefetch_related(
                    "files",
                    "logs",
                )
                .annotate(
                    act_hours=Coalesce(
                        Subquery(
                            submission_qs
                            .values("assignid__quotation")
                            .annotate(
                                total_hours=ExpressionWrapper(
                                    Sum("hours") / Value(3600.0),
                                    output_field=FloatField(),
                                )
                            )
                            .values("total_hours")[:1]
                        ),
                        Value(0.0),
                    ),
                    actual_start_date=Subquery(
                        submission_qs.order_by("date").values("date")[:1],
                        output_field=DateField(),
                    ),
                    actual_end_date=Subquery(
                        log_qs.filter(status="completed")
                        .order_by("-created_at")
                        .values("created_at__date")[:1],
                        output_field=DateField(),
                    ),
                    latest_logremarks=Subquery(
                        log_qs.order_by("-created_at")
                        .values("remarks")[:1],
                        output_field=CharField(),
                    ),
                )
                .annotate(
                    work_efficiency=Round(
                        ExpressionWrapper(
                            (F("est_hours") / NullIf(F("act_hours"), Value(0.0))) * 100,
                            output_field=FloatField(),
                        ),
                        2,
                    ),
                    planned_duration=ExpressionWrapper(
                        F("target_date") - F("created_at__date"),
                        output_field=DurationField(),
                    ),
                    actual_duration=ExpressionWrapper(
                        F("actual_end_date") - F("actual_start_date"),
                        output_field=DurationField(),
                    ),
                )
                .order_by("-created_at")
            )
        except Exception:
            logger.exception(
                "Failed to fetch tickets for user '%s'.",
                self.request.user.username,
            )
            raise
    
    def perform_create(self, serializer):
        try:
            serializer.save(creator=self.request.user)
        except Exception:
            logger.exception(
                "Failed to create ticket by user '%s'.",
                self.request.user.username,
            )
            raise

    def update(self, request, *args, **kwargs):
        """
        Overridden to ensure the request user is passed to the serializer 
        context for the logging logic.
        """
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            deleted_ids = json.loads(
                    request.data.get("deleted_file_ids", "[]")
                )

            for ticket_file in Ticket_File.objects.filter(
                id__in=deleted_ids,
                ticket=instance,
            ):
                ticket_file.file.delete(save=False)
                ticket_file.delete()
            
            # We pass the request to the serializer so it knows WHO is making the change
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            return Response(serializer.data)
        except Exception as e:
            logger.exception(
                "Failed to update ticket '%s' (ID=%s) by user '%s'.",
                instance.number,
                instance.pk,
                request.user.username,
            )
            raise
 
    def destroy(self, request, *args, **kwargs):
        try:
            logger.info(f"User {request.user} is attempting to delete ticket {self.get_object().number}.")
            return super().destroy(request, *args, **kwargs)
        except Exception:
            logger.exception(
                "Failed to delete ticket '%s' (ID=%s) by user '%s'.",
                ticket.number,
                ticket.pk,
                request.user.username,
            )
            raise
    
    @action(detail=False, methods=["get"])
    def summary(self, request):
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())

        queryset = self.get_queryset()

        excluded_status = ["recall requested", "recall successful"]

        active_status = [
            "open",
            "modified",
            "reopened",
            "not-satisfied",
        ]

        progress_status = ["assigned", "accepted","in progress"]

        # ----------------------------------
        # Status Summary (Single Query)
        # ----------------------------------
        status_summary = queryset.exclude(
            current_status__in=excluded_status
        ).aggregate(
            Open=Count(
                "id",
                filter=Q(current_status__in=active_status),
            ),
            InProgress=Count(
                "id",
                filter=Q(current_status__in=progress_status),
            ),
            Completed=Count(
                "id",
                filter=Q(current_status="completed"),
            ),
            Rejected=Count(
                "id",
                filter=Q(current_status="rejected"),
            ),
            Closed=Count(
                "id",
                filter=Q(current_status="closed"),
            ),
            On_Hold=Count(
                "id",
                filter=Q(current_status="on hold"),
            ),
            Feedback=Count(
                "id",
                filter=Q(current_status="feedback"),
            ),
        )

        statuses = {
            k.replace("_", "-"): v
            for k, v in status_summary.items()
            if v > 0
        }

        # ----------------------------------
        # Department Counts
        # ----------------------------------
        departments = list(
            queryset.values("department__name")
            .annotate(total=Count("id"))
            .order_by("department__name")
        )

       
        # ----------------------------------
        # Subqueries
        # ----------------------------------
        submission_hours = (
            Submission.objects.filter(
                assignid__quotation=OuterRef("number")
            )
            .values("assignid__quotation")
            .annotate(
                total_hours=ExpressionWrapper(
                    Sum("hours") / 3600.0,
                    output_field=FloatField(),
                )
            )
            .values("total_hours")
        )

        last_completed = (
            Ticket_Log.objects.filter(
                ticket=OuterRef("pk"),
                status="completed",
            )
            .order_by("-created_at")
            .values("created_at__date")[:1]
        )

        # ----------------------------------
        # Weekly Target Tickets
        # ----------------------------------
        weekly_target_tickets = list(
            queryset.filter(
                target_date__gte=start_of_week,
                current_status__in=active_status,
            )
            .annotate(
                creator_name=F("creator__first_name"),
                assigned_to_name=F("assigned_to__first_name"),
                act_hours=Coalesce(
                    Subquery(
                        submission_hours,
                        output_field=FloatField(),
                    ),
                    0.0,
                ),
                actual_end_date=Subquery(
                    last_completed,
                    output_field=DateField(),
                ),
            )
            .values(
                "number",
                "task",
                "priority",
                "target_date",
                "current_status",
                "creator_name",
                "assigned_to_name",
                "act_hours",
                "actual_end_date",
            )
            .order_by("-created_at")
        )

        # ----------------------------------
        # Department Chart
        # ----------------------------------
        dept_chart = list(
            queryset.filter(
                current_status__in=active_status + progress_status
            )
            .values("department__name")
            .annotate(count=Count("id"))
            .order_by("department__name")
        )

        total = len(dept_chart)

        deptData = [
            {
                "name": row["department__name"],
                "count": row["count"],
                "color": f"hsl({int(i * 360 / total)},65%,55%)",
            }
            for i, row in enumerate(dept_chart)
        ]

        return Response(
            {
                "total": queryset.exclude(
                    current_status__in=excluded_status
                ).count(),
                "statuses": statuses,
                "departments": {
                    d["department__name"]: d["total"]
                    for d in departments
                    if d["department__name"]
                },
                "deptData": deptData,
                "weekly_target_tickets": weekly_target_tickets
            }
        )

class SelfTicketViewSet(DepartmentMixin,viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SelfTicketSerializer
    
    def get_queryset(self):
        try:
            department_ids = self.get_department_ids()
            group_filter = Group.objects.filter(
                    user=OuterRef("creator"),
                    id__in=department_ids,
                )
            include_doList =(
                self.request.query_params.get("do_List", "false").lower()
                == "true"
                )
            # get reportee ids
            reportee_ids = []

            if include_doList:
                reportee_ids = User.objects.filter(
                    profile__reporting_to=self.request.user
                ).values_list("id", flat=True)

            return (
                    Self_Ticket.objects
                    .select_related("creator")
                    .exclude(current_status="cancelled")
                    .annotate(
                        has_group=Exists(group_filter),
                        reporting_to=F("creator__profile__reporting_to"),
                        creator_name=F("creator__first_name"),
                    )
                    .filter(
                        Q(creator=self.request.user) |
                        Q(creator_id__in=reportee_ids) |
                        Q(has_group=True)
                    )
                    .order_by("-created_at")
                )
        except Exception:
            logger.exception(
                "Failed to fetch self-tickets for user '%s'.",
                self.request.user.username,
            )
            raise

    def perform_create(self, serializer):
        try:
            serializer.save(creator=self.request.user)
        except ValidationError as e:
            logger.error(
                "Validation error while creating self-ticket by user '%s': %s",
                self.request.user.username,
                e,
            )
            raise
        except Exception:
            logger.exception(
                "Failed to create self-ticket by user '%s'.",
                self.request.user.username,
            )
            raise

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            excluded_fields = {"id", "created_at"}

            allowed_fields = {
                field.name
                for field in instance._meta.fields
                if field.name not in excluded_fields
            }

            data = {
                key: value
                for key, value in request.data.items()
                if key in allowed_fields
            }

            # Include comments if provided
            if "comments" in request.data:
                data["comments"] = request.data["comments"]
           
            serializer = self.get_serializer(instance, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data)
        except Exception:
            logger.exception(
                "Failed to update self-ticket '%s' (ID=%s) by user '%s'.",
                instance.number,
                instance.pk,
                request.user.username,
            )
            raise
   
    def destroy(self, request, *args, **kwargs):
        try:
            logger.info(f"User {request.user} is attempting to delete ticket {self.get_object().number}.")
            return super().destroy(request, *args, **kwargs)
        except Exception:
            logger.exception(
                "Failed to delete ticket '%s' (ID=%s) by user '%s'.",
                ticket.number,
                ticket.pk,
                request.user.username,
            )
            raise

class NotificationView(DepartmentMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        self.request = request

        department_ids = self.get_department_ids()

        ticket_queryset = Ticket.objects.filter(
            creator__groups__in=department_ids
        ).distinct()

        notifications = {
            "selfticketOpenCount":
                Self_Ticket.objects.filter(
                    creator=request.user,
                    current_status="open"
                ).count(),
            "ticketOpenCount":
                ticket_queryset.filter(
                    Q(
                        assigned_to=request.user,
                        current_status__in=[
                            "open",
                            "in progress",
                            "assigned",
                            "feedback provided",
                            "modified",
                            "recall requested",
                            "reopened",
                            "not-satisfied"
                        ]
                    )
                    |
                    Q(
                        creator=request.user,
                        current_status__in=[
                            "completed",
                            "rejected"
                        ]
                    )
                ).count()
        }

        return Response(notifications)

def dailyMail(request):
    try:
        today = date.today()

        reminderList = []

        selfTickets = Self_Ticket.objects.filter(current_status="open",reminder_interval__gt=0,creator__in = [9,26]).values("number",
                            "creator__first_name","creator__email","task",
                            "description","est_hours","target_date","priority","current_status",
                            "created_at","updated_at","type",
                            "ticket_number","reminder_interval")

        for ticket in selfTickets:
            created_date = ticket["created_at"].date()
            target_date = ticket["target_date"]
            interval = ticket["reminder_interval"]

            if created_date == today:
                continue
            days_since_created = (today - created_date).days

            if days_since_created % interval == 0:
                ticket["target_date"] = ticket["target_date"].strftime("%d-%m-%Y")
                reminderList.append(ticket)
        
    except Exception as e:
        logger.exception("Error occurred while processing daily mail for self tickets.")
        return JsonResponse({"error": "An error occurred while processing the request."}, status=500)

    return JsonResponse({ "selfTicketsData":reminderList,
                        'todayDate':today.strftime('%d-%b-%Y')
                            })