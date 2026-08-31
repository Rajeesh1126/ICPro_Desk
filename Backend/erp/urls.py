from django.urls import include, path
from rest_framework import routers

from .views import (
    IcproProjectViewSet,
    CustomerViewSet,
    QuotationViewSet,
    QuotationCostViewSet,
    CostMasterViewSet,
    CostCategoryViewSet,
)

router = routers.DefaultRouter()
router.register(r'projects', IcproProjectViewSet, basename='icproproject')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'quotations', QuotationViewSet, basename='quotation')
router.register(r'quotation-costs', QuotationCostViewSet, basename='quotationcost')
router.register(r'cost-masters', CostMasterViewSet, basename='costmaster')
router.register(r'cost-categories', CostCategoryViewSet, basename='costcategory')

urlpatterns = [
    path('', include(router.urls)),
]
