from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework import permissions


class RoleBasedPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False):
            return True

        required_codename = self._get_required_permission_codename(request, view)
        if not required_codename:
            return True

        profile = getattr(request.user, 'profile', None)
        role = getattr(profile, 'role', None)
        if not role:
            return False

        model_cls = self._get_model_class(view)
        if model_cls is None:
            return True

        content_type = ContentType.objects.get_for_model(model_cls)
        return role.permissions.filter(content_type=content_type, codename=required_codename).exists()

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False):
            return True

        required_codename = self._get_required_permission_codename(request, view, obj=obj)
        if not required_codename:
            return True

        profile = getattr(request.user, 'profile', None)
        role = getattr(profile, 'role', None)
        if not role:
            return False

        model_cls = self._get_model_class(view, obj=obj)
        if model_cls is None:
            return True

        content_type = ContentType.objects.get_for_model(model_cls)
        return role.permissions.filter(content_type=content_type, codename=required_codename).exists()

    def _get_required_permission_codename(self, request, view, obj=None):
        if getattr(view, 'action', None) in {'change_password', 'forgot_password', 'reset_password'}:
            return None

        if request.method in permissions.SAFE_METHODS:
            action_name = 'view'
        elif request.method == 'POST':
            action_name = 'add'
        elif request.method in {'PUT', 'PATCH'}:
            action_name = 'change'
        elif request.method == 'DELETE':
            action_name = 'delete'
        else:
            return None

        model_cls = self._get_model_class(view, obj=obj)
        if model_cls is None:
            return None

        default_codename = f'{action_name}_{model_cls._meta.model_name}'
        permission_codename_map = getattr(view, 'permission_codename_map', {})
        action = getattr(view, 'action', None)

        return (
            permission_codename_map.get(action)
            or permission_codename_map.get(action_name)
            or permission_codename_map.get(default_codename)
            or default_codename
        )

    def _get_model_class(self, view, obj=None):
        if obj is not None:
            return obj.__class__

        queryset = getattr(view, 'queryset', None)
        if queryset is not None:
            return queryset.model

        serializer_class = getattr(view, 'serializer_class', None)
        if serializer_class is None:
            return None

        meta_class = getattr(serializer_class, 'Meta', None)
        return getattr(meta_class, 'model', None)
