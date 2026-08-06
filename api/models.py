from django.conf import settings
from django.db import models


class Project(models.Model):
    quotation = models.CharField(max_length=25, blank=True, null=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    system_name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    customer_name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    customer_code = models.CharField(max_length=20, null=True, blank=True, db_index=True)
    quoted_date = models.DateField(null=True, blank=True, db_index=True)

    def __str__(self):
        return f"{self.name} ({self.quotation})" if self.quotation else self.name

class Milestone(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones', db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    def __str__(self):
        return f"{self.name} ({self.due_date})" if self.due_date else self.name

class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks', db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, null=True)
    milestone = models.ForeignKey('api.Milestone', on_delete=models.CASCADE, null=True, blank=True, related_name='tasks', db_index=True)

    def __str__(self):
        return f"{self.name} ({self.external_id})" if self.external_id else self.name

class AssignedTask(models.Model):
    assign_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_tasks',
        db_index=True,
    )
    assign_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='tasks',
        db_index=True,
    )
   

    start_date = models.DateField(null=True, blank=True, db_index=True)
    end_date = models.DateField(null=True, blank=True, db_index=True)
    created_date = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_date = models.DateTimeField(auto_now=True)
   
    # New normalized relations (nullable for backward-compatibility)
    project_obj = models.ForeignKey(
        'api.Project', on_delete=models.CASCADE, null=True, blank=True, related_name='assigned_tasks', db_index=True
    )
    task_obj = models.ForeignKey(
        'api.Task', on_delete=models.CASCADE, null=True, blank=True, related_name='assigned_tasks', db_index=True
    )
    milestone_obj = models.ForeignKey(
        'api.Milestone', on_delete=models.CASCADE, null=True, blank=True, related_name='assigned_tasks', db_index=True
    )

    class Meta:
        indexes = [
            models.Index(fields=['assign_to', 'project_obj']),
            models.Index(fields=['assign_by']),
            models.Index(fields=['start_date', 'end_date']),
        ]
        ordering = ['-created_date']

    def __str__(self):
        return f"{self.task_obj} ({self.project_obj}) -> {self.assign_to}"


class Submission(models.Model):
    assignId = models.ForeignKey('api.AssignedTask', on_delete=models.CASCADE, db_index=True)
    date = models.DateField()
    hours = models.PositiveIntegerField(default=0)
    rate = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=50, blank=True, null=True, default=None)
    rejection_reason = models.TextField(blank=True, null=True, default=None)
    approvedBy = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='approved_submissions',
        db_index=True,
        blank=True,
        null=True,
    )
    approved_status = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.assignId} - {self.date}"


class TimesheetStatus(models.Model):
    STATUS_CHOICES = [
        ('Requested', 'Requested'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]
    uid = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_index=True,
        related_name='timesheet_statuses',
    )
    timesheet_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Requested', null=True)
    weeknumber = models.IntegerField(default=None, null=True, db_index=True)
    submission_status = models.BooleanField(default=False)
    action_status = models.BooleanField(default=False)
    weekyear = models.IntegerField(default=None, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    unlock_reason = models.CharField(max_length=1000, default=None, null=True)
    unlock_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Requested', null=True)
    updated_date = models.DateTimeField(auto_now=True)
    comments = models.CharField(max_length=1000, blank=True, null=True, default=None)

    class Meta:
        indexes = [
            models.Index(fields=['uid', 'weeknumber']),
        ]
        default_permissions = ()

    def __str__(self):
        return f"TimesheetStatus({self.uid} - {self.weekyear}: W{self.weeknumber})"
