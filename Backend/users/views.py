from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group,Permission
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from core.permissions import RoleBasedPermission
from .models import  Role
from .serializers import (
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    GroupSerializer,
    ResetPasswordSerializer,
    RoleSerializer,
    UserSerializer,
    TeamSerializer,
    DepartmentSerializer,
    PermissionSerializer
)
# logger = logging.getLogger(__name__)

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
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

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated, RoleBasedPermission]

# get who are all reportes 
class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated, RoleBasedPermission]

    def get_queryset(self):
        return (
            User.objects
            .filter(profile__reporting_to=self.request.user)
            .select_related("profile")
            .order_by("first_name", "last_name")
        )


class DepartmentViewSet(viewsets.ModelViewSet):

    queryset = Group.objects.all().order_by('name')

    serializer_class = DepartmentSerializer

    permission_classes = [permissions.IsAuthenticated, RoleBasedPermission]

    http_method_names = [
        'get',
        'put',
        'patch',
    ]

 
    
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def currentUserGroups(request):
    user_groups = Group.objects.filter(
        user=request.user
    )

    managed_departments = Group.objects.filter(
        manager_mapping__manager=request.user
    )

    departments = (
        (user_groups | managed_departments)
        .distinct()
        .order_by('name')
    )
    department_ids = list(departments.values_list('id', flat=True))

    userslist = (
        User.objects
        .filter(groups__id__in=department_ids)
        .values('id', 'username', 'first_name', 'last_name', 'email')
        .distinct()
        .order_by('first_name', 'last_name', 'username')
    )
    data = {
        "department_ids": department_ids,
        "departments": DepartmentSerializer(departments, many=True).data,
        "groups": GroupSerializer(user_groups.order_by('name'), many=True).data,
        "managed_departments": DepartmentSerializer(
            managed_departments.order_by('name'),
            many=True,
        ).data,
        "userslist": list(userslist),
    }
    return Response(data)

class PermissionListViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Permission.objects
            .select_related('content_type')
            .filter(
                content_type__app_label='users',
                content_type__model='role',
                codename__startswith='access_',
            )
            .order_by('name', 'id')
            .distinct()
        )
