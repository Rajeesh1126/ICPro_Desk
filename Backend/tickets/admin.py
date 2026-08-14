from django.contrib import admin

from .models import Ticket, Ticket_File, Ticket_Log, Self_Ticket, Self_Ticket_Log


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ["number", "task", "creator", "assigned_to", "department", "current_status", "priority", "created_at"]
    list_filter = ["current_status", "priority", "department", "created_at"]
    search_fields = ["number", "task", "creator__username", "assigned_to__username"]
    readonly_fields = ["number", "created_at", "updated_at"]


@admin.register(Ticket_Log)
class TicketLogAdmin(admin.ModelAdmin):
    list_display = ["ticket", "status", "assigned_to", "changed_by", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["ticket__number", "changed_by__username", "assigned_to__username"]


@admin.register(Ticket_File)
class TicketFileAdmin(admin.ModelAdmin):
    list_display = ["ticket", "file", "uploaded_at"]
    search_fields = ["ticket__number"]


@admin.register(Self_Ticket)
class SelfTicketAdmin(admin.ModelAdmin):
    list_display = ["number", "task", "creator", "current_status", "priority", "target_date", "created_at"]
    list_filter = ["current_status", "priority", "type", "created_at"]
    search_fields = ["number", "task", "creator__username"]
    readonly_fields = ["number", "created_at", "updated_at"]


@admin.register(Self_Ticket_Log)
class SelfTicketLogAdmin(admin.ModelAdmin):
    list_display = ["self_ticket", "creator", "created_at"]
    search_fields = ["self_ticket__number", "creator__username", "comments"]
