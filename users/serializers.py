from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from rest_framework import serializers

from .models import Department, Role, UserProfile

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        required=False,
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions']


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'type', 'description']


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SlugRelatedField(
        queryset=Role.objects.all(),
        slug_field='name',
        source='profile.role',
        allow_null=True,
        required=False,
    )
    role_permissions = serializers.SerializerMethodField()
    department = serializers.SlugRelatedField(
        many=True,
        queryset=Department.objects.all(),
        slug_field='name',
        source='profile.department',
        required=False,
    )
    groups = serializers.SlugRelatedField(
        many=True,
        queryset=Group.objects.all(),
        slug_field='name',
        required=False,
    )
    reporting_to = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field='username',
        source='profile.reporting_to',
        allow_null=True,
        required=False,
    )
    location = serializers.CharField(source='profile.location', allow_blank=True, required=False)
    dept_role = serializers.BooleanField(source='profile.dept_role', required=False)
    exe_role = serializers.BooleanField(source='profile.exe_role', required=False)
    designation = serializers.CharField(source='profile.designation', allow_blank=True, required=False)
    resign_date = serializers.DateField(source='profile.resign_date', allow_null=True, required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'role',
            'role_permissions',
            'department',
            'groups',
            'reporting_to',
            'location',
            'dept_role',
            'exe_role',
            'designation',
            'resign_date',
        ]
        read_only_fields = ['id', 'is_active']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        department_data = profile_data.pop('department', [])
        groups_data = validated_data.pop('groups', [])
        user = super().create(validated_data)
        profile = UserProfile.objects.create(user=user, **profile_data)
        if department_data:
            profile.department.set(department_data)
        if groups_data:
            user.groups.set(groups_data)
        return user

    def get_role_permissions(self, obj):
        role = getattr(obj.profile, 'role', None)
        if not role:
            return []
        return [f"{perm.content_type.app_label}.{perm.codename}" for perm in role.permissions.all()]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        department_data = profile_data.pop('department', None)
        groups_data = validated_data.pop('groups', None)
        user = super().update(instance, validated_data)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        if department_data is not None:
            profile.department.set(department_data)
        if groups_data is not None:
            user.groups.set(groups_data)
        return user
