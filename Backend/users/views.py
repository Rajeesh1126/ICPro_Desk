from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import RoleBasedPermission
from .models import Department, Role
from .serializers import (
    ChangePasswordSerializer,
    DepartmentSerializer,
    ForgotPasswordSerializer,
    GroupSerializer,
    ResetPasswordSerializer,
    RoleSerializer,
    UserSerializer,
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, RoleBasedPermission]

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def forgot_password(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'message': 'If an account with that email exists, a password reset email has been sent.'},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def reset_password(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password reset successfully.'}, status=status.HTTP_200_OK)

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, RoleBasedPermission]


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, RoleBasedPermission]


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated, RoleBasedPermission]
