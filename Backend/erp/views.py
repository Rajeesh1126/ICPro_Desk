from rest_framework import viewsets
from datetime import datetime
from django.db.models import (
    Case,
    CharField,
    F,
    Max,
    OuterRef,
    Prefetch,
    Q,
    Subquery,
    Sum,
    Value,
    When
)
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Submission
from core.permissions import RoleBasedPermission
from .models import IcproProject, Customer, Quotation, QuotationCost, CostMaster, CostCategory
from .serializers import (
    IcproProjectSerializer,
    CustomerSerializer,
    QuotationSerializer,
    QuotationCostSerializer,
    CostMasterSerializer,
    CostCategorySerializer,
)

class IcproProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IcproProject.objects.all()
    serializer_class = IcproProjectSerializer
    permission_classes = [RoleBasedPermission]


class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [RoleBasedPermission]


class QuotationViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = QuotationSerializer
    permission_classes = [RoleBasedPermission]

    def get_queryset(self):

        latest_ids = (
            Quotation.objects
            .filter(
                quotation_no__isnull=False,
                customer_name__isnull=False,
                # custom_project_name__isnull=False,
                create_date__gte=datetime(2026, 1, 1, 0, 0),
            )
            .exclude(status__in=["Closed", "Lost"])
            .values("quotation_no")
            .annotate(latest_id=Max("id"))
            .values_list("latest_id", flat=True)
        )

        return (
            Quotation.objects
            .filter(id__in=latest_ids)
            .order_by("-create_date")[:10]
        )

    @action(detail=False, methods=['get'], url_path='budget-summary')
    def budget_summary(self, request):
        latest_ids = (
            Quotation.objects
            .filter(quotation_no__isnull=False)
            .values("quotation_no")
            .annotate(latest_id=Max("id"))
            .values_list("latest_id", flat=True)
        )
        quotations = list(
            Quotation.objects
            .filter(id__in=latest_ids)
            .order_by("-create_date")[:20]
        )
        quotation_ids = [quotation.id for quotation in quotations]

        budget_quantity_by_quotation = {
            item["quotation_id"]: item["total_quantity"] or 0
            for item in (
                QuotationCost.objects
                .filter(quotation_id__in=quotation_ids)
                .values("quotation_id")
                .annotate(total_quantity=Sum("quantity"))
            )
        }
        actual_seconds_by_quotation = {
            item["assignId__project_obj__quotation_id"]: item["total_seconds"] or 0
            for item in (
                Submission.objects
                .filter(
                    assignId__project_obj__quotation_id__in=quotation_ids,
                    hours__gt=0,
                )
                .values("assignId__project_obj__quotation_id")
                .annotate(total_seconds=Sum("hours"))
            )
        }

        payload = []
        for quotation in quotations:
            budget_hours = round(
                float(budget_quantity_by_quotation.get(quotation.id, 0)) * 9,
                2,
            )
            actual_hours = round(
                float(actual_seconds_by_quotation.get(quotation.id, 0)) / 3600,
                2,
            )
            variance_hours = round(budget_hours - actual_hours, 2)
            utilization_percent = (
                round((actual_hours / budget_hours) * 100, 2)
                if budget_hours > 0
                else 0
            )

            payload.append({
                "quotation_id": quotation.id,
                "quotation_no": quotation.quotation_no,
                "revision_number": quotation.revision_number,
                "covering_letter_subject": quotation.covering_letter_subject,
                "customer_name": quotation.customer_name,
                "status": quotation.status,
                "create_date": quotation.create_date,
                "budget_hours": budget_hours,
                "actual_hours": actual_hours,
                "variance_hours": variance_hours,
                "utilization_percent": utilization_percent,
            })

        return Response(payload)


class QuotationCostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QuotationCost.objects.all()
    serializer_class = QuotationCostSerializer
    permission_classes = [RoleBasedPermission]


class CostMasterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CostMaster.objects.all()
    serializer_class = CostMasterSerializer
    permission_classes = [RoleBasedPermission]


class CostCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CostCategory.objects.all().order_by('name')
    serializer_class = CostCategorySerializer
    permission_classes = [RoleBasedPermission]
