from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet,SelfTicketViewSet,dailyMail,NotificationView

# 1. Initialize the router
router = DefaultRouter()

# 2. Register your ViewSet
# The r'tickets' prefix will result in /api/tickets/tickets/ 
# if your project-level path is also 'api/tickets/'. 
# Usually, we leave this as an empty string '' if the prefix is in the main urls.py.
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'self-tickets', SelfTicketViewSet, basename='self-tickets')

# 3. Define the patterns variable (MUST be named 'urlpatterns')

urlpatterns = [
    path('dailyMail/', dailyMail, name='dailyMail'),
    path('summary/', TicketViewSet.as_view({'get': 'summary'}), name='ticket-summary'), # New summary endpoint
    path("notifications/", NotificationView.as_view(), name="notifications"),
    path('', include(router.urls)),
]