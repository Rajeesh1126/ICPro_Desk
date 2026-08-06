from rest_framework import serializers

from .models import TimeSheetEntry


class TimeSheetEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSheetEntry
        fields = ['id', 'user', 'project', 'date', 'hours', 'description', 'created_at', 'updated_at']
