from django.conf import settings
from django.db import models



class Project(models.Model):
    quotation_id = models.BigIntegerField(blank=True, null=True, db_index=True)
    code = models.CharField(max_length=40, blank=True, null=True, unique=True, db_index=True)
    customer = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    description = models.CharField(max_length=255, blank=True, null=True,db_index=True)
    
    class Meta:
        db_table = 'api_project'

    def __str__(self):
        return f"{self.code}-{self.description}"


class Milestone(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones', db_index=True)
    category = models.BigIntegerField(blank=True, null=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)

    class Meta:
        db_table = 'api_milestone'

    def __str__(self):
        return f"{self.name}" if self.id else self.name


class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks', db_index=True)
    cost =models.BigIntegerField(blank=True, null=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, null=True)
    milestone = models.ForeignKey(
        Milestone,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='tasks',
        db_index=True,
    )

    class Meta:
        db_table = 'api_task'

    def __str__(self):
        return f"{self.name}" if self.id else self.project


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
    project_obj = models.ForeignKey(
        Project, on_delete=models.CASCADE, null=True, blank=True, related_name='assigned_tasks', db_index=True
    )
    task_obj = models.ForeignKey(
        Task, on_delete=models.CASCADE, null=True, blank=True, related_name='assigned_tasks', db_index=True
    )
    milestone_obj = models.ForeignKey(
        Milestone, on_delete=models.CASCADE, null=True, blank=True, related_name='assigned_tasks', db_index=True
    )

    class Meta:
        db_table = 'api_assignedtask'
        indexes = [
            models.Index(fields=['assign_to', 'project_obj']),
            models.Index(fields=['assign_by']),
            models.Index(fields=['start_date', 'end_date']),
        ]
        ordering = ['-created_date']

    def __str__(self):
        return f"{self.task_obj} ({self.project_obj}) -> {self.assign_to}"


class Phases(models.Model):

    PHASE_CHOICES = [
        ("Sales", "Sales"),
        ("Execution", "Execution"),
        ("Service", "Service"),
    ]

    phase = models.CharField(
        max_length=20,
        choices=PHASE_CHOICES,
        default="Sales",
    )

    cost_category = models.BigIntegerField(
        blank=True,
        null=True,
        db_index=True,
    )

    class Meta:
        verbose_name = 'Phase'
        verbose_name_plural = 'Phases'
        constraints = [
            models.UniqueConstraint(
                fields=['phase', 'cost_category'],
                name='unique_phase_cost_category',
            ),
        ]

    def __str__(self):
        return self.phase
