from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, permissions, viewsets
from rest_framework.parsers import JSONParser, FormParser

from core.permissions import RoleBasedPermission
from .models import CalendarEntry
from .serializers import CalendarEntrySerializer, CalendarFilterSerializer
from .parsers import CalendarMultipartParser


class CalendarEntryPermission(RoleBasedPermission):
    def has_object_permission(self, request, view, obj):
        if not super().has_object_permission(request, view, obj):
            return False
        return (
            request.method in permissions.SAFE_METHODS
            or request.user.is_staff
            or request.user.is_superuser
            or obj.created_by_id == request.user.pk
        )


@extend_schema_view(list=extend_schema(parameters=[CalendarFilterSerializer]))
class CalendarEntryViewSet(viewsets.ModelViewSet):
    queryset = CalendarEntry.objects.select_related('created_by').prefetch_related('participants', 'files')
    parser_classes = [JSONParser, CalendarMultipartParser, FormParser]
    serializer_class = CalendarEntrySerializer
    permission_classes = [CalendarEntryPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_at', 'end_at', 'created_at', 'title']
    ordering = ['start_at', 'id']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Range filters apply to collections, not object lookups during updates.
        if self.action != 'list':
            return queryset
        serializer = CalendarFilterSerializer(data=self.request.query_params)
        serializer.is_valid(raise_exception=True)
        params = serializer.validated_data
        if 'start' in params:
            queryset = queryset.filter(end_at__gt=params['start'])
        if 'end' in params:
            queryset = queryset.filter(start_at__lt=params['end'])
        for field in ['entry_type', 'status', 'created_by']:
            if field in params:
                queryset = queryset.filter(**{field: params[field]})
        if 'participant_id' in params:
            queryset = queryset.filter(participants__pk=params['participant_id'])
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
