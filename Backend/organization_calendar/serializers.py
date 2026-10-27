from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
from django.db import transaction
from rest_framework import serializers

from .models import CalendarAttachment, CalendarEntry


class CalendarAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarAttachment
        fields = ['id', 'name', 'file', 'uploaded_at']


def validate_attachment_size(file):
    if file.size > 25 * 1024 * 1024:
        raise serializers.ValidationError('Each file must be 25 MB or smaller.')


class CalendarEntrySerializer(serializers.ModelSerializer):
    files = CalendarAttachmentSerializer(many=True, read_only=True)
    attachments = serializers.ListField(
        child=serializers.FileField(validators=[
            FileExtensionValidator(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'png', 'jpg', 'jpeg']),
            validate_attachment_size,
        ]), write_only=True, required=False, max_length=10,
    )
    remove_attachment_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), write_only=True, required=False,
    )
    participants = serializers.PrimaryKeyRelatedField(
        many=True, queryset=get_user_model().objects.filter(is_active=True), required=False,
    )
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CalendarEntry
        fields = [
            'id', 'title', 'description', 'entry_type', 'status', 'start_at', 'end_at',
            'all_day', 'location', 'meeting_url', 'participants', 'created_by',
            'created_by_name', 'created_at', 'updated_at',
            'files', 'attachments', 'remove_attachment_ids',
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at', 'updated_at']

    def get_created_by_name(self, obj) -> str:
        if not obj.created_by:
            return ''
        return obj.created_by.get_full_name() or obj.created_by.username

    def validate(self, attrs):
        start = attrs.get('start_at', getattr(self.instance, 'start_at', None))
        end = attrs.get('end_at', getattr(self.instance, 'end_at', None))
        if start and end and end <= start:
            raise serializers.ValidationError({'end_at': 'Must be after start_at.'})
        existing_ids = set(self.instance.files.values_list('id', flat=True)) if self.instance else set()
        removed_ids = set(attrs.get('remove_attachment_ids', []))
        if not removed_ids.issubset(existing_ids):
            raise serializers.ValidationError({'remove_attachment_ids': 'Files must belong to this entry.'})
        if len(existing_ids - removed_ids) + len(attrs.get('attachments', [])) > 10:
            raise serializers.ValidationError({'attachments': 'An entry can have at most 10 files.'})
        return attrs

    def save_attachments(self, instance, files):
        for file in files:
            CalendarAttachment.objects.create(entry=instance, file=file, name=file.name)

    @transaction.atomic
    def create(self, validated_data):
        files = validated_data.pop('attachments', [])
        validated_data.pop('remove_attachment_ids', None)
        instance = super().create(validated_data)
        self.save_attachments(instance, files)
        return instance

    @transaction.atomic
    def update(self, instance, validated_data):
        files = validated_data.pop('attachments', [])
        removed_ids = validated_data.pop('remove_attachment_ids', [])
        instance = super().update(instance, validated_data)
        instance.files.filter(id__in=removed_ids).delete()
        self.save_attachments(instance, files)
        return instance


class CalendarFilterSerializer(serializers.Serializer):
    start = serializers.DateTimeField(required=False)
    end = serializers.DateTimeField(required=False)
    entry_type = serializers.ChoiceField(choices=CalendarEntry.EntryType.choices, required=False)
    status = serializers.ChoiceField(choices=CalendarEntry.Status.choices, required=False)
    participant_id = serializers.IntegerField(min_value=1, required=False)
    created_by = serializers.IntegerField(min_value=1, required=False)

    def validate(self, attrs):
        if 'start' in attrs and 'end' in attrs and attrs['end'] <= attrs['start']:
            raise serializers.ValidationError({'end': 'Must be after start.'})
        return attrs
