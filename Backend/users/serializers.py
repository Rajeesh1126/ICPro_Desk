from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Department, Role, UserProfile

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)
        role = role = self.user.profile.role

        permissions = []

        if role:
            permissions = list(
                role.permissions.values_list("codename", flat=True)
            )
        return {
            "refresh": data["refresh"],
            "access": data["access"],
            "id": self.user.id,
            "first_name":self.user.first_name,
            "role": role.name if role else None,
            "permissions": permissions,
        }

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


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({'old_password': 'Incorrect old password.'})
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        try:
            validate_password(attrs['new_password'], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'new_password': list(exc.messages)})
        return attrs

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def save(self):
        user = User.objects.filter(email__iexact=self.validated_data['email']).first()
        if user:
            token = default_token_generator.make_token(user)
            mail.send_mail(
                'Password reset request',
                f'Use the following token to reset your password: {token}',
                'noreply@example.com',
                [user.email],
                fail_silently=False,
            )
        return user


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        user = User.objects.filter(email__iexact=attrs['email']).first()
        if not user:
            raise serializers.ValidationError({'email': 'No user found with that email.'})
        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({'token': 'Invalid or expired reset token.'})
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        try:
            validate_password(attrs['new_password'], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'new_password': list(exc.messages)})
        return attrs

    def save(self):
        user = User.objects.filter(email__iexact=self.validated_data['email']).first()
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user


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
            'password',
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
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }

    def validate_password(self, value):
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as exc:
                raise serializers.ValidationError(list(exc.messages))
        return value

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        department_data = profile_data.pop('department', [])
        groups_data = validated_data.pop('groups', [])
        password = validated_data.pop('password', None)

        user = super().create(validated_data)
        if password is not None:
            user.set_password(password)
            user.save(update_fields=['password'])

        profile = UserProfile.objects.create(user=user, **profile_data)
        if department_data:
            profile.department.set(department_data)
        if groups_data:
            user.groups.set(groups_data)
        return user

    def get_role_permissions(self, obj):
        profile = getattr(obj, 'profile', None)
        role = getattr(profile, 'role', None)
        if not role:
            return []
        return [f"{perm.content_type.app_label}.{perm.codename}" for perm in role.permissions.all()]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        department_data = profile_data.pop('department', None)
        groups_data = validated_data.pop('groups', None)
        password = validated_data.pop('password', None)

        user = super().update(instance, validated_data)
        if password is not None:
            user.set_password(password)
            user.save(update_fields=['password'])

        profile, _ = UserProfile.objects.get_or_create(user=user)
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        if department_data is not None:
            profile.department.set(department_data)
        if groups_data is not None:
            user.groups.set(groups_data)
        return user


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
        ]


