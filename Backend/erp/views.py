from rest_framework import viewsets
from datetime import datetime
from core.permissions import RoleBasedPermission
from .models import IcproProject, CostSpecification, Customer, Quotation, QuotationCost, CostMaster
from .serializers import (
    IcproProjectSerializer,
    CostSpecificationSerializer,
    CustomerSerializer,
    QuotationSerializer,
    QuotationCostSerializer,
    CostMasterSerializer,
)

class IcproProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IcproProject.objects.all()
    serializer_class = IcproProjectSerializer
    permission_classes = [RoleBasedPermission]

class CostSpecificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CostSpecification.objects.all()
    serializer_class = CostSpecificationSerializer
    permission_classes = [RoleBasedPermission]

class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [RoleBasedPermission]


class QuotationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QuotationSerializer
    permission_classes = [RoleBasedPermission]
    def get_queryset(self):
        return Quotation.objects.filter(
            create_date__gte=datetime(2026, 1, 1, 0, 0)
        ).order_by('-create_date')[:10]


class QuotationCostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QuotationCost.objects.all()
    serializer_class = QuotationCostSerializer
    permission_classes = [RoleBasedPermission]


class CostMasterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CostMaster.objects.all()
    serializer_class = CostMasterSerializer
    permission_classes = [RoleBasedPermission]
