from rest_framework import viewsets

from .models import TimeSheetEntry
from .serializers import TimeSheetEntrySerializer


class TimeSheetEntryViewSet(viewsets.ModelViewSet):
    queryset = TimeSheetEntry.objects.all()
    serializer_class = TimeSheetEntrySerializer
