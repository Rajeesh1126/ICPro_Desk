from django.urls import include, path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import DepartmentViewSet, GroupViewSet, RoleViewSet, UserViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    path('users/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
