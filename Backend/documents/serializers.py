from rest_framework import serializers

from .models import DocumentTemplate, LessonLearnt, SystemSuggestion


class UserNameMixin:
    def _get_user_name(self, user):
        if not user:
            return None
        return user.get_full_name() or user.username

    def get_created_by_name(self, obj):
        return self._get_user_name(getattr(obj, "created_by", None))

    def get_uploaded_by_name(self, obj):
        return self._get_user_name(getattr(obj, "uploaded_by", None))

    def get_user_name(self, obj):
        return self._get_user_name(getattr(obj, "user", None))


class DocumentTemplateSerializer(UserNameMixin, serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DocumentTemplate
        fields = [
            "id",
            "document_name",
            "document_type",
            "version",
            "description",
            "file",
            "uploaded_by",
            "uploaded_by_name",
            "created_at",
            "updated_at",
            "is_active",
        ]
        read_only_fields = ["uploaded_by", "created_at", "updated_at"]


class LessonLearntSerializer(UserNameMixin, serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = LessonLearnt
        fields = [
            "id",
            "project",
            "category",
            "event",
            "limitations",
            "actions",
            "remarks",
            "status",
            "file",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]


class SystemSuggestionSerializer(UserNameMixin, serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = SystemSuggestion
        fields = [
            "id",
            "user",
            "user_name",
            "suggestion",
            "status",
            "remarks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "created_at", "updated_at"]
