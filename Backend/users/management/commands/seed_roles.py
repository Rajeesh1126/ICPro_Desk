from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand

from users.models import Role

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed default roles and attach common permissions to them.'

    def handle(self, *args, **options):
        role_permissions = {
            'Admin': [
                'view_user', 'add_user', 'change_user', 'delete_user',
                'view_role', 'add_role', 'change_role', 'delete_role',
                'view_department', 'add_department', 'change_department', 'delete_department',
                'view_group', 'add_group', 'change_group', 'delete_group',
                'view_project', 'add_project', 'change_project', 'delete_project',
                'view_task', 'add_task', 'change_task', 'delete_task',
                'view_milestone', 'add_milestone', 'change_milestone', 'delete_milestone',
                'view_assignedtask', 'add_assignedtask', 'change_assignedtask', 'delete_assignedtask',
                'view_submission', 'add_submission', 'change_submission', 'delete_submission',
                'view_timesheetstatus', 'add_timesheetstatus', 'change_timesheetstatus', 'delete_timesheetstatus',
                'view_ticket', 'add_ticket', 'change_ticket', 'delete_ticket',
                'view_self_tickets', 'add_self_ticket', 'change_self_ticket', 'delete_self_ticket',
                'view_managementoverview', 'view_report',
            ],
            'Manager': [
                'view_user', 'change_user',
                'view_role',
                'view_department', 'change_department',
                'view_group',
                'view_project', 'add_project', 'change_project',
                'view_task', 'add_task', 'change_task',
                'view_milestone', 'add_milestone', 'change_milestone',
                'view_assignedtask', 'add_assignedtask', 'change_assignedtask',
                'view_submission', 'add_submission', 'change_submission',
                'view_timesheetstatus', 'add_timesheetstatus', 'change_timesheetstatus',
                'view_ticket', 'add_ticket', 'change_ticket',
                'view_self_tickets', 'add_self_ticket', 'change_self_ticket',
                'view_managementoverview', 'view_report',
            ],
            'Viewer': [
                'view_user',
                'view_role',
                'view_department',
                'view_group',
                'view_project',
                'view_task',
                'view_milestone',
                'view_assignedtask',
                'view_submission',
                'view_timesheetstatus',
                'view_ticket',
                'view_self_tickets',
                'view_managementoverview',
                'view_report',
            ],
        }

        for role_name, codename_list in role_permissions.items():
            role, created = Role.objects.get_or_create(name=role_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created role: {role_name}'))
            else:
                self.stdout.write(f'Role already exists: {role_name}')

            permissions = Permission.objects.filter(codename__in=codename_list)
            role.permissions.set(permissions)
            self.stdout.write(self.style.SUCCESS(f'Assigned {permissions.count()} permissions to {role_name}'))

        self.stdout.write(self.style.SUCCESS('Role permission seeding completed.'))
