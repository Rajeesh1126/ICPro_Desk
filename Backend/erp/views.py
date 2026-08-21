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
from core.permissions import RoleBasedPermission
from .models import IcproProject, Customer, Quotation, QuotationCost, CostMaster
from .serializers import (
    IcproProjectSerializer,
    CustomerSerializer,
    QuotationSerializer,
    QuotationCostSerializer,
    CostMasterSerializer,
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


class QuotationCostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QuotationCost.objects.all()
    serializer_class = QuotationCostSerializer
    permission_classes = [RoleBasedPermission]


class CostMasterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CostMaster.objects.all()
    serializer_class = CostMasterSerializer
    permission_classes = [RoleBasedPermission]
