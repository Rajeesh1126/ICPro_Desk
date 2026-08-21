from django.db import models


# Define ERP models here.
# For read-only external ERP tables, set managed = False in Meta and specify db_table.
# Example:
#
class IcproProject(models.Model):
    id = models.BigIntegerField(primary_key=True)
    code = models.CharField(unique=True, max_length=50)
    name = models.CharField(unique=True, max_length=100)
    status = models.CharField(max_length=10)
    create_date = models.DateTimeField()
    create_user = models.CharField(max_length=50)
    create_user_id = models.BigIntegerField()
    last_updated_date = models.DateTimeField()
    last_updated_user = models.CharField(max_length=50)
    last_updated_user_id = models.BigIntegerField()
    version_lock = models.BigIntegerField(blank=True, null=True)
    project_engineer_name = models.CharField(max_length=200, blank=True, null=True)
    project_engineer_id = models.BigIntegerField(blank=True, null=True)
    project_manager_name = models.CharField(max_length=200, blank=True, null=True)
    project_manager_id = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icpro_project'
        default_permissions = ()

class CostSpecification(models.Model):
    id = models.BigIntegerField(primary_key=True)
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    create_date = models.DateTimeField()
    create_user = models.CharField(max_length=50)
    create_user_id = models.BigIntegerField()
    last_updated_date = models.DateTimeField()
    last_updated_user = models.CharField(max_length=50)
    last_updated_user_id = models.BigIntegerField()
    version_lock = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cost_specification'
        unique_together = (('code', 'name'),)
        default_permissions = ()

class CostMaster(models.Model):
    id = models.BigIntegerField(primary_key=True)
    # Add actual ERP cost master fields here when available.

    class Meta:
        managed = False
        db_table = 'cost_master'
        default_permissions = ()

class Customer(models.Model):
    id = models.BigIntegerField(primary_key=True)
    business_value = models.FloatField(blank=True, null=True)
    code = models.CharField(unique=True, max_length=10)
    company_website = models.CharField(max_length=200, blank=True, null=True)
    customer_type = models.CharField(max_length=25, blank=True, null=True)
    industry_domain = models.CharField(max_length=255, blank=True, null=True)
    industry_domain_name = models.CharField(max_length=100, blank=True, null=True)
    is_internation = models.TextField(blank=True, null=True)  # This field type is a guess.
    name = models.CharField(unique=True, max_length=255)
    status = models.CharField(max_length=10)
    create_date = models.DateTimeField()
    create_user = models.CharField(max_length=50)
    create_user_id = models.BigIntegerField()
    last_updated_date = models.DateTimeField()
    last_updated_user = models.CharField(max_length=50)
    last_updated_user_id = models.BigIntegerField()
    version_lock = models.BigIntegerField(blank=True, null=True)
    customer_manager_id = models.BigIntegerField(blank=True, null=True)
    bom_margin_percentage = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'customer'
        default_permissions = ()

class Quotation(models.Model):
    id = models.BigIntegerField(primary_key=True)
    about_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    architecture_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    bom_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    company_profile = models.TextField(blank=True, null=True)
    covering_letter = models.TextField(blank=True, null=True)
    letter_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    covering_letter_subject = models.CharField(max_length=255, blank=True, null=True)
    draft_no = models.CharField(max_length=40, blank=True, null=True)
    parent_quotation_id = models.BigIntegerField(blank=True, null=True)
    price_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    project_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    quotation_no = models.CharField(max_length=40, blank=True, null=True)
    quote_date = models.DateTimeField()
    quote_expiry_date = models.DateTimeField()
    quote_value = models.FloatField(blank=True, null=True)
    remarks = models.CharField(max_length=1000, blank=True, null=True)
    revision_number = models.IntegerField(blank=True, null=True)
    sale_type = models.CharField(max_length=20)
    status = models.CharField(max_length=20)
    supply_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    create_date = models.DateTimeField()
    create_user = models.CharField(max_length=50)
    create_user_id = models.BigIntegerField()
    last_updated_date = models.DateTimeField()
    last_updated_user = models.CharField(max_length=50)
    last_updated_user_id = models.BigIntegerField()
    version_lock = models.BigIntegerField(blank=True, null=True)
    work_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    project = models.ForeignKey(IcproProject, models.DO_NOTHING, blank=True, null=True)
    bom_price_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    repeated_quote = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)
    repeated = models.CharField(max_length=50, blank=True, null=True)
    bom_partno_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    bom_material_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    bom_qty_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    bom_rate_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    bom_group_by_category = models.TextField(blank=True, null=True)  # This field type is a guess.
    header_image_country_id = models.BigIntegerField(blank=True, null=True)
    header_image_location_id = models.BigIntegerField(blank=True, null=True)
    quote_discount_value = models.BigIntegerField(blank=True, null=True)
    quote_discount_type = models.CharField(max_length=255, blank=True, null=True)
    quote_discount_amount = models.BigIntegerField(blank=True, null=True)
    enquiry_number = models.CharField(max_length=200, blank=True, null=True)
    customer_name = models.CharField(max_length=200, blank=True, null=True)
    cost_group = models.CharField(max_length=200, blank=True, null=True)
    custom_group = models.TextField(blank=True, null=True)  # This field type is a guess.
    cost_category_group = models.CharField(max_length=200, blank=True, null=True)
    system_name = models.CharField(max_length=255, blank=True, null=True)
    total_service_pricing_label = models.CharField(max_length=255, blank=True, null=True)
    total_supply_pricing_label = models.CharField(max_length=255, blank=True, null=True)
    total_service_price = models.FloatField(blank=True, null=True)
    total_supply_price = models.FloatField(blank=True, null=True)
    total_pricing_label = models.CharField(max_length=255, blank=True, null=True)
    bom_group_pricing_description = models.CharField(max_length=255, blank=True, null=True)
    system_architecture_header_name = models.CharField(max_length=400, blank=True, null=True)
    table_header_background_color = models.CharField(max_length=100, blank=True, null=True)
    table_footer_background_color = models.CharField(max_length=100, blank=True, null=True)
    bom_lumpsum = models.TextField(blank=True, null=True)  # This field type is a guess.
    engservice_pricelumpsum = models.TextField(blank=True, null=True)  # This field type is a guess.
    total_lumpsum = models.TextField(blank=True, null=True)  # This field type is a guess.
    bom_specifications_show_me = models.TextField(blank=True, null=True)  # This field type is a guess.
    custom_project_name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'quotation'
        unique_together = (('quotation_no', 'revision_number'),)
        default_permissions = ()

class QuotationCost(models.Model):
    id = models.BigIntegerField(primary_key=True)
    cost_name = models.CharField(max_length=255, blank=True, null=True)
    cost_specification_name = models.CharField(max_length=255, blank=True, null=True)
    exchange_rate = models.FloatField(blank=True, null=True)
    net_amount = models.FloatField(blank=True, null=True)
    quantity = models.FloatField(blank=True, null=True)
    selling_pricing = models.FloatField(blank=True, null=True)
    create_date = models.DateTimeField()
    create_user = models.CharField(max_length=50)
    create_user_id = models.BigIntegerField()
    last_updated_date = models.DateTimeField()
    last_updated_user = models.CharField(max_length=50)
    last_updated_user_id = models.BigIntegerField()
    tax_amount = models.FloatField(blank=True, null=True)
    tax_percentage = models.FloatField(blank=True, null=True)
    total_price = models.FloatField(blank=True, null=True)
    version_lock = models.BigIntegerField(blank=True, null=True)
    cost = models.ForeignKey('CostMaster', models.DO_NOTHING, blank=True, null=True)
    cost_specification = models.ForeignKey(CostSpecification, models.DO_NOTHING, blank=True, null=True)
    quotation = models.ForeignKey(Quotation, models.DO_NOTHING, blank=True, null=True)
    custom_group_name = models.CharField(max_length=200, blank=True, null=True)
    table_group_name = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    category_grouping = models.CharField(max_length=200, blank=True, null=True)
    pricing_label = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'quotation_cost'
        default_permissions = ()