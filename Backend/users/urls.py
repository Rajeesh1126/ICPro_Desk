from django.urls import include, path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import  GroupViewSet, RoleViewSet, UserViewSet,TeamViewSet,CustomTokenObtainPairView,currentUserGroups,UserWithGroupsViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
# router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r"users-with-groups",UserWithGroupsViewSet,basename="users-with-groups")

urlpatterns = [
    path('users/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/currentUserGroups/', currentUserGroups, name='currentUserGroups'),
   
    path('', include(router.urls)),
]
