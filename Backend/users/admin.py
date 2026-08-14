from django.contrib import admin

from .models import  Role,  UserProfile


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']
    filter_horizontal = ['permissions']


# @admin.register(Department)
# class DepartmentAdmin(admin.ModelAdmin):
#     list_display = ['name', 'type']
#     list_filter = ['type']
#     search_fields = ['name']


# @admin.register(UserDepartment)
# class UserDepartmentAdmin(admin.ModelAdmin):
#     list_display = ['profile', 'department', 'added_at']
#     search_fields = ['profile__user__username', 'department__name']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'designation', 'resign_date']
    search_fields = ['user__username', 'location', 'designation']
