from django.db import models


# Define ERP models here.
# For read-only external ERP tables, set managed = False in Meta and specify db_table.
# Example:
#
class IcproProject(models.Model):
    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(unique=True, max_length=100)
   
    class Meta:
        managed = False
        db_table = 'icpro_project'

class CostCategory(models.Model):
    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cost_category'

class CostMaster(models.Model):
    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    cost_category = models.ForeignKey(CostCategory, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'cost_master'

class Customer(models.Model):
    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(unique=True, max_length=255)
    
    class Meta:
        managed = False
        db_table = 'customer'

class Quotation(models.Model):
    id = models.BigIntegerField(primary_key=True)
    covering_letter_subject = models.CharField(max_length=255, blank=True, null=True)
    quotation_no = models.CharField(max_length=40, blank=True, null=True)
    create_date = models.DateTimeField()
    revision_number = models.IntegerField(blank=True, null=True)
    sale_type = models.CharField(max_length=20)
    status = models.CharField(max_length=20)
    project = models.ForeignKey(IcproProject, models.DO_NOTHING, blank=True, null=True)
    customer_name = models.CharField(max_length=200, blank=True, null=True)
    system_name = models.CharField(max_length=255, blank=True, null=True)
    custom_project_name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'quotation'
        unique_together = (('quotation_no', 'revision_number'),)

class QuotationCost(models.Model):
    id = models.BigIntegerField(primary_key=True)
    cost_name = models.CharField(max_length=255, blank=True, null=True)
    quantity = models.FloatField(blank=True, null=True)
    cost = models.ForeignKey('CostMaster', models.DO_NOTHING, blank=True, null=True)
    quotation = models.ForeignKey(Quotation, models.DO_NOTHING, blank=True, null=True)
   
    class Meta:
        managed = False
        db_table = 'quotation_cost'
