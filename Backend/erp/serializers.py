from rest_framework import serializers

from .models import IcproProject, Customer, Quotation, QuotationCost, CostMaster


class IcproProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = IcproProject
        fields = ['id','name']


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name']


class QuotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quotation
        fields = ['id', 'quotation_no', 'revision_number', 'sale_type', 'status', 'create_date', 
            'covering_letter_subject', 'customer_name', 'custom_project_name', 'system_name']


class QuotationCostSerializer(serializers.ModelSerializer):
    cost = serializers.PrimaryKeyRelatedField(read_only=True)
    quotation = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = QuotationCost
        fields = ['id', 'cost_name', 'quantity','quotation','cost']


class CostMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostMaster
        fields = ['id','name']
