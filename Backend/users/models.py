from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission,Group
from django.db import models

User = get_user_model()


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    permissions = models.ManyToManyField(Permission, blank=True, related_name='roles')

    class Meta:
        permissions = [
            
            ('access_self_tickets', 'Can access Do List page'),
            ('access_tickets', 'Can access Tickets page'),
            ('access_timesheet', 'Can access Timesheet page'),

            ('access_document_template', 'Can access Document Template page'),
            ('access_lesson_learnt', 'Can access Lesson Learnt page'),
            ('access_system_suggetions', 'Can access System Suggetions page'),

            ('access_timesheet_log', 'Can access Timesheet Log page'),
            ('access_executive_overview', 'Can access Executive Overview page'),
            ('access_team_analysis', 'Can access Team Analysis page'),
            ('access_user_management', 'Can access User Management page'),
            ('access_role_management', 'Can access Role Management page'),
            ('access_project_configuration', 'Can access Project Configuration page'),
            ('access_phase_configuration', 'Can access Phase Configuration page'),
        ]

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    reporting_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='subordinates',
    )
    location = models.CharField(max_length=100, blank=True, null=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, blank=True, null=True, related_name='profiles')
  
    dept_role = models.BooleanField(default=False)
    exe_role = models.BooleanField(default=False)
    designation = models.CharField(max_length=150, blank=True, null=True)
    resign_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"Profile for {self.user.username}"


class DepartmentManager(models.Model):

    department = models.OneToOneField(
        Group,
        on_delete=models.CASCADE,
        related_name='manager_mapping'
    )

    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_departments'
    )

    def __str__(self):
        return f"{self.department.name} - {self.manager}"
