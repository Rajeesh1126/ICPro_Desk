from django.contrib import admin

from .models import  Role,  UserProfile


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']
    filter_horizontal = ['permissions']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'designation', 'resign_date']
    search_fields = ['user__username', 'location', 'designation']
