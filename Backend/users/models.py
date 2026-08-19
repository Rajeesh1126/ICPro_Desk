from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission,Group
from django.db import models

User = get_user_model()


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    permissions = models.ManyToManyField(Permission, blank=True, related_name='roles')

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
