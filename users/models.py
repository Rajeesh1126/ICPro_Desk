from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.db import models

User = get_user_model()


class Role(models.Model):
    name = models.CharField(max_length=150, unique=True)
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
    location = models.CharField(max_length=255, blank=True, null=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, blank=True, null=True, related_name='profiles')
    department = models.ManyToManyField(
        'Department',
        through='UserDepartment',
        related_name='profiles',
        blank=True,
    )
    dept_role = models.BooleanField(default=False)
    exe_role = models.BooleanField(default=False)
    designation = models.CharField(max_length=150, blank=True, null=True)
    resign_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"Profile for {self.user.username}"


class Department(models.Model):
    TYPE_DEPARTMENT = 'department'
    TYPE_TEAM = 'team'
    TYPE_CHOICES = [
        (TYPE_DEPARTMENT, 'Software'),
        (TYPE_TEAM, 'Software'),
    ]

    name = models.CharField(max_length=150)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_DEPARTMENT)
    description = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('name', 'type')

    def __str__(self):
        return f"{self.name} ({self.type})"


class UserDepartment(models.Model):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='department_mappings')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='user_mappings')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('profile', 'department')

    def __str__(self):
        return f"{self.profile.user.username} → {self.department}"
