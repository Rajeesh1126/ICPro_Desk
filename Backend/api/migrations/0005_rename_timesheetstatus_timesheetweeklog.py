from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def rename_timesheet_status_permissions(apps, schema_editor):
    ContentType = apps.get_model('contenttypes', 'ContentType')
    Permission = apps.get_model('auth', 'Permission')
    Role = apps.get_model('users', 'Role')

    old_content_type = ContentType.objects.filter(
        app_label='api',
        model='timesheetstatus',
    ).first()
    new_content_type = ContentType.objects.filter(
        app_label='api',
        model='timesheetweeklog',
    ).first()
    content_type = old_content_type or new_content_type

    if not content_type:
        return

    content_type.model = 'timesheetweeklog'
    content_type.save(update_fields=['model'])

    for action in ['add', 'change', 'delete', 'view']:
        old_codename = f'{action}_timesheetstatus'
        new_codename = f'{action}_timesheetweeklog'
        old_permission = Permission.objects.filter(
            content_type=content_type,
            codename=old_codename,
        ).first()
        new_permission = Permission.objects.filter(
            content_type=content_type,
            codename=new_codename,
        ).first()

        if old_permission and new_permission:
            for role in Role.objects.filter(permissions=old_permission):
                role.permissions.add(new_permission)
            old_permission.delete()
        elif old_permission:
            old_permission.codename = new_codename
            old_permission.name = f'Can {action} timesheet week log'
            old_permission.save(update_fields=['codename', 'name'])


def reverse_timesheet_status_permissions(apps, schema_editor):
    ContentType = apps.get_model('contenttypes', 'ContentType')
    Permission = apps.get_model('auth', 'Permission')
    Role = apps.get_model('users', 'Role')

    content_type = ContentType.objects.filter(
        app_label='api',
        model='timesheetweeklog',
    ).first()
    if not content_type:
        return

    content_type.model = 'timesheetstatus'
    content_type.save(update_fields=['model'])

    for action in ['add', 'change', 'delete', 'view']:
        old_codename = f'{action}_timesheetweeklog'
        new_codename = f'{action}_timesheetstatus'
        old_permission = Permission.objects.filter(
            content_type=content_type,
            codename=old_codename,
        ).first()
        new_permission = Permission.objects.filter(
            content_type=content_type,
            codename=new_codename,
        ).first()

        if old_permission and new_permission:
            for role in Role.objects.filter(permissions=old_permission):
                role.permissions.add(new_permission)
            old_permission.delete()
        elif old_permission:
            old_permission.codename = new_codename
            old_permission.name = f'Can {action} timesheet status'
            old_permission.save(update_fields=['codename', 'name'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_alter_timesheetstatus_options'),
        ('users', '0016_alter_role_options'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameModel(
            old_name='TimesheetStatus',
            new_name='TimesheetWeekLog',
        ),
        migrations.AlterField(
            model_name='timesheetweeklog',
            name='uid',
            field=models.ForeignKey(
                db_index=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='timesheet_week_logs',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.RenameIndex(
            model_name='timesheetweeklog',
            new_name='api_timeshe_uid_id_cb61e8_idx',
            old_name='api_timeshe_uid_id_6c057d_idx',
        ),
        migrations.RunPython(
            rename_timesheet_status_permissions,
            reverse_timesheet_status_permissions,
        ),
    ]
