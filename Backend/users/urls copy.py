from django.urls import include, path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import  GroupViewSet,PermissionListView, RoleViewSet, UserViewSet,TeamViewSet,CustomTokenObtainPairView,currentUserGroups,DepartmentViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'permissions', PermissionListView, basename='permission')
router.register(
    r'departments',
    DepartmentViewSet,
    basename='departments'
)

urlpatterns = [
    path('users/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/currentUserGroups/', currentUserGroups, name='currentUserGroups'),
    path('', include(router.urls)),
]
