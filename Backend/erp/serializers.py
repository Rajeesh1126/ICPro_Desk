from rest_framework import serializers

from .models import IcproProject, CostSpecification, Customer, Quotation, QuotationCost, CostMaster


class IcproProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = IcproProject
        fields = [
            'id', 'code', 'name', 'status', 'create_date', 'create_user', 'create_user_id',
            'last_updated_date', 'last_updated_user', 'last_updated_user_id', 'version_lock',
            'project_engineer_name', 'project_engineer_id', 'project_manager_name', 'project_manager_id',
        ]


class CostSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostSpecification
        fields = ['id', 'code', 'name', 'create_date', 'create_user', 'create_user_id', 'last_updated_date', 'last_updated_user', 'last_updated_user_id', 'version_lock']


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id', 'business_value', 'code', 'company_website', 'customer_type', 'industry_domain',
            'industry_domain_name', 'is_internation', 'name', 'status', 'create_date', 'create_user',
            'create_user_id', 'last_updated_date', 'last_updated_user', 'last_updated_user_id',
            'version_lock', 'customer_manager_id', 'bom_margin_percentage',
        ]


class QuotationSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(read_only=True)
    repeated_quote = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Quotation
        fields = [
            'id', 'quotation_no', 'revision_number', 'quote_date', 'quote_expiry_date', 'quote_value',
            'remarks', 'sale_type', 'status', 'create_date', 'create_user', 'create_user_id',
            'last_updated_date', 'last_updated_user', 'last_updated_user_id', 'version_lock',
            'project', 'repeated_quote', 'repeated', 'customer_name', 'cost_group', 'system_name',
        ]


class QuotationCostSerializer(serializers.ModelSerializer):
    cost = serializers.PrimaryKeyRelatedField(read_only=True)
    cost_specification = serializers.PrimaryKeyRelatedField(read_only=True)
    quotation = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = QuotationCost
        fields = [
            'id', 'cost_name', 'cost_specification_name', 'exchange_rate', 'net_amount',
            'quantity', 'selling_pricing', 'tax_amount', 'tax_percentage', 'total_price',
            'version_lock', 'cost', 'cost_specification', 'quotation', 'custom_group_name',
            'table_group_name', 'description', 'category_grouping', 'pricing_label',
        ]


class CostMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostMaster
        fields = ['id']
