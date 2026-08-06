from rest_framework import viewsets

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


class CostSpecificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CostSpecification.objects.all()
    serializer_class = CostSpecificationSerializer


class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class QuotationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer


class QuotationCostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QuotationCost.objects.all()
    serializer_class = QuotationCostSerializer


class CostMasterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CostMaster.objects.all()
    serializer_class = CostMasterSerializer
