from django.contrib import admin

from .models import CalendarEntry


@admin.register(CalendarEntry)
class CalendarEntryAdmin(admin.ModelAdmin):
    list_display = ['title', 'entry_type', 'status', 'start_at', 'end_at', 'created_by']
    list_filter = ['entry_type', 'status', 'all_day']
    search_fields = ['title', 'description', 'location']
    filter_horizontal = ['participants']
    readonly_fields = ['created_at', 'updated_at']
