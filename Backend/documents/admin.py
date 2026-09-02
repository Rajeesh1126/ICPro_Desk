from django.contrib import admin

from .models import DocumentTemplate, LessonLearnt, SystemSuggestion


@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = ("document_name", "document_type", "version", "is_active", "uploaded_by", "updated_at")
    list_filter = ("document_type", "is_active")
    search_fields = ("document_name", "version", "description")


@admin.register(LessonLearnt)
class LessonLearntAdmin(admin.ModelAdmin):
    list_display = ("project", "category", "status", "created_by", "created_at")
    list_filter = ("category", "status")
    search_fields = ("project", "category", "event", "actions", "remarks")


@admin.register(SystemSuggestion)
class SystemSuggestionAdmin(admin.ModelAdmin):
    list_display = ("user", "status", "created_at", "updated_at")
    list_filter = ("status",)
    search_fields = ("suggestion", "remarks", "user__username", "user__first_name", "user__last_name")
