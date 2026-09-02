from rest_framework import filters, viewsets

from core.permissions import RoleBasedPermission
from .models import DocumentTemplate, LessonLearnt, SystemSuggestion
from .serializers import (
    DocumentTemplateSerializer,
    LessonLearntSerializer,
    SystemSuggestionSerializer,
)


class DocumentTemplateViewSet(viewsets.ModelViewSet):
    queryset = DocumentTemplate.objects.select_related("uploaded_by").all()
    serializer_class = DocumentTemplateSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["document_name", "document_type", "version", "description"]
    ordering_fields = ["document_name", "document_type", "version", "updated_at"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        document_type = self.request.query_params.get("document_type")
        is_active = self.request.query_params.get("is_active")

        if document_type:
            queryset = queryset.filter(document_type__iexact=document_type)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() in {"1", "true", "yes"})

        return queryset

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class LessonLearntViewSet(viewsets.ModelViewSet):
    queryset = LessonLearnt.objects.select_related("created_by").all()
    serializer_class = LessonLearntSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["project", "category", "event", "limitations", "actions", "remarks"]
    ordering_fields = ["project", "category", "status", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        project = self.request.query_params.get("project")
        category = self.request.query_params.get("category")
        status = self.request.query_params.get("status")
        created_by = self.request.query_params.get("created_by")

        if project:
            queryset = queryset.filter(project__icontains=project)
        if category:
            queryset = queryset.filter(category__iexact=category)
        if status:
            queryset = queryset.filter(status__iexact=status)
        if created_by:
            queryset = queryset.filter(created_by_id=created_by)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SystemSuggestionViewSet(viewsets.ModelViewSet):
    queryset = SystemSuggestion.objects.select_related("user").all()
    serializer_class = SystemSuggestionSerializer
    permission_classes = [RoleBasedPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["suggestion", "remarks", "user__username", "user__first_name", "user__last_name"]
    ordering_fields = ["status", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get("status")
        user = self.request.query_params.get("user")

        if status:
            queryset = queryset.filter(status__iexact=status)
        if user:
            queryset = queryset.filter(user_id=user)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
