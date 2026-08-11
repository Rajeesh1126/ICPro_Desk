from django.db import models, transaction
from django.utils import timezone
from django.conf import settings
# from django.contrib.auth.models import Users
from django.contrib.auth.models import Group
# Moved inside or kept outside based on preference, 
# but consistent naming (PascalCase for Classes) is key.

# Create your models here.
STATUS_CHOICES = [
    ('open', 'Open'),
    ('assigned', 'Assigned'),
    ('accepted', 'Accepted'),
    ('on hold','On Hold'),
    ('in progress','In Progress'),
    ('feedback provided','Feedback Provided'),
    ('completed', 'Completed'),
    ('closed', 'Closed'),
    ('rejected', 'Rejected'),
    ('recall requested', 'Recall Requested'),
    ('recall successful','Recall Successful'),
    ('modified','Modified'),
    ('not-satisfied','Not-Satisfied'),
    ('cancelled','Cancelled'),
]

class Ticket(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    number = models.CharField(max_length=30, unique=True, editable=False)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='created_tickets')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_ticket')
    task = models.CharField(max_length=200)
    description = models.TextField(max_length=2000)
    department = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True, related_name='groups')
    est_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    target_date = models.DateField(default=timezone.now)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    current_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    rating = models.IntegerField(null=True, blank=True , default=0) # Optional field for user feedback
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.number:
            with transaction.atomic(): # Prevents duplicate ticket numbers during race conditions
                today = timezone.now().date()
                today_str = today.strftime('%d%m%y')
                last_ticket = Ticket.objects.filter(number__contains=today_str).order_by('-id').first()
                
                if last_ticket:
                    # Extract sequence from "TM-20231027-0001"
                    last_sequence = int(last_ticket.number.split('-')[-1])
                    new_sequence = last_sequence + 1
                else:
                    new_sequence = 1

                self.number = f"TM-{today_str}-{new_sequence:03d}"
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.number} - {self.task}"

    class Meta:
        default_permissions = ()
        # customise the permissions for the Notice model
        permissions = [
            ('view_ticket', 'Handle View Ticket'),
            ('add_ticket', 'Handle Create Ticket')]

class Ticket_Log(models.Model): # Renamed from Ticket_Logs (PEP8 style)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='logs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    # The person assigned to the ticket AT THIS STAGE
    assigned_to = models.ForeignKey( settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='log_assignments')
    # The person who actually performed the update (e.g., an Admin or the User)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='logs_changed')
    remarks = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        default_permissions = ()

class Ticket_File(models.Model): # Renamed from Ticket_Files
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='files')
    file =  models.FileField(upload_to='%d-%m-%Y')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        default_permissions = ()

class Self_Ticket(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    number = models.CharField(max_length=30, unique=True, editable=False)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='created_self_tickets')
    
    task = models.CharField(max_length=200)
    description = models.TextField(max_length=2000)
    est_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    target_date = models.DateField(default=timezone.now)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    current_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    type = models.CharField(max_length=10, default='open')
    ticket_number = models.CharField(max_length=30, blank=True, null=True)
    reminder_interval = models.IntegerField(default=1)

    # comments = models.CharField(max_length=500,default=None,null=True) 

    def save(self, *args, **kwargs):
        if not self.number:
            with transaction.atomic(): # Prevents duplicate ticket numbers during race conditions
                today = timezone.now().date()
                today_str = today.strftime('%d%m%y')
                last_ticket = Self_Ticket.objects.filter(number__contains=today_str).order_by('-id').first()
                
                if last_ticket:
                    # Extract sequence from "TM-20231027-0001"
                    last_sequence = int(last_ticket.number.split('-')[-1])
                    new_sequence = last_sequence + 1
                else:
                    new_sequence = 1

                self.number = f"DL-{today_str}-{new_sequence:03d}"
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.number} - {self.task}"

    class Meta:
        default_permissions = ()
        # customise the permissions for the Notice model
        permissions = [
            ('view_self_tickets', 'Handle Self Ticket'),
            ('view_managementoverview', 'Handle Management Overview'),
            ('view_report', 'Handle Ticket Report')]

class Self_Ticket_Log(models.Model):
    self_ticket = models.ForeignKey(Self_Ticket, on_delete=models.CASCADE, related_name='selfLogs')
    comments = models.CharField(max_length=500, blank=True, null=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='created_self_log') 
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        default_permissions = ()