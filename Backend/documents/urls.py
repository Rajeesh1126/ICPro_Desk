from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    DocumentTemplateViewSet,
    LessonLearntViewSet,
    SystemSuggestionViewSet,
)


router = DefaultRouter()
router.register(r"document-templates", DocumentTemplateViewSet, basename="document-template")
router.register(r"lesson-learnt", LessonLearntViewSet, basename="lesson-learnt")
router.register(r"system-suggestions", SystemSuggestionViewSet, basename="system-suggestion")

urlpatterns = [
    path("", include(router.urls)),
]
