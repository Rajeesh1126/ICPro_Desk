from django.urls import include, path
from rest_framework import routers

from .views import TimeSheetEntryViewSet

router = routers.DefaultRouter()
router.register(r'timesheet-entries', TimeSheetEntryViewSet, basename='timesheetentry')

urlpatterns = [
    path('', include(router.urls)),
]
