from django.db import models
from django.conf import settings


class Submission(models.Model):
    assignId = models.ForeignKey('projects.AssignedTask', on_delete=models.CASCADE, db_index=True)
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
