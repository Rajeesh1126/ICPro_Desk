from django.contrib import admin

from .models import IcproProject, Customer, Quotation, QuotationCost, CostMaster


@admin.register(IcproProject)
class IcproProjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ['id', 'quotation_no','revision_number','customer_name','custom_project_name',
                    'system_name','create_date', 'status']
    search_fields = ['quotation_no', 'customer_name','custom_project_name',]


@admin.register(QuotationCost)
class QuotationCostAdmin(admin.ModelAdmin):
    list_display = ['id', 'cost_name', 'quotation']
    search_fields = ['cost_name', 'quotation__quotation_no']


@admin.register(CostMaster)
class CostMasterAdmin(admin.ModelAdmin):
    list_display = ['id','name']
