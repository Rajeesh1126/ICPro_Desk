from rest_framework.routers import DefaultRouter

from .views import CalendarEntryViewSet

router = DefaultRouter()
router.register('entries', CalendarEntryViewSet, basename='calendar-entry')
urlpatterns = router.urls
