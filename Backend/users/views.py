from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action,api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from core.permissions import RoleBasedPermission
from .models import  Role
from .serializers import (
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
    # DepartmentSerializer,
    ForgotPasswordSerializer,
    GroupSerializer,
    UserWithGroupsSerializer,
    ResetPasswordSerializer,
    RoleSerializer,
    UserSerializer,
    TeamSerializer
)
from django.http import JsonResponse
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

# class DepartmentViewSet(viewsets.ModelViewSet):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer
#     permission_classes = [permissions.IsAuthenticated, RoleBasedPermission]

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

class UserWithGroupsViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = UserWithGroupsSerializer
    permission_classes = [permissions.IsAuthenticated, RoleBasedPermission]

    def get_queryset(self):
        return (
            User.objects
            .filter(groups__isnull=False)
            .prefetch_related("groups")
            .distinct()
        )


@api_view(['GET'])
def currentUserGroups(request):
    groups = list(
        request.user.groups.values('name','id')
    )
    executive_depts = list(
        request.user.profile.department_mappings.values('department__name','id')
    )
    departments = groups + executive_depts

    unique_departments = list({
        dept['id']: dept
        for dept in departments
    }.values())
    department_ids = [dept['id'] for dept in unique_departments]

    userslist = User.objects.filter(groups__id__in = department_ids).values('first_name',"id").distinct()
    data = {
        "department_ids":department_ids,
        "departments": unique_departments,
        "userslist":list(userslist)
    }
    return JsonResponse(data)
