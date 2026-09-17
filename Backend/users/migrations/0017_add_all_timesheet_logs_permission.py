from django.db import migrations


TIMESHEET_LOG_PERMISSION = (
    'access_all_timesheet_logs',
    'Can view all employee timesheet submission and reviewer logs',
)


def create_all_timesheet_logs_permission(apps, schema_editor):
    ContentType = apps.get_model('contenttypes', 'ContentType')
    Permission = apps.get_model('auth', 'Permission')
    Role = apps.get_model('users', 'Role')

    role_content_type, _ = ContentType.objects.get_or_create(
        app_label='users',
        model='role',
    )
    permission, _ = Permission.objects.get_or_create(
        content_type=role_content_type,
        codename=TIMESHEET_LOG_PERMISSION[0],
        defaults={'name': TIMESHEET_LOG_PERMISSION[1]},
    )

    admin_role = Role.objects.filter(name__iexact='Admin').first()
    if admin_role:
        admin_role.permissions.add(permission)


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_alter_role_options'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='role',
            options={
                'permissions': [
                    ('access_self_tickets', 'Can access Do List page'),
                    ('access_tickets', 'Can access Tickets page'),
                    ('access_timesheet', 'Can access Timesheet page'),
                    TIMESHEET_LOG_PERMISSION,
                    ('access_document_template', 'Can access Document Template page'),
                    ('access_lesson_learnt', 'Can access Lesson Learnt page'),
                    ('access_system_suggetions', 'Can access System Suggetions page'),
                    ('access_timesheet_log', 'Can access Timesheet Log page'),
                    ('access_executive_overview', 'Can access Executive Overview page'),
                    ('access_team_analysis', 'Can access Team Analysis page'),
                    ('access_user_management', 'Can access User Management page'),
                    ('access_role_management', 'Can access Role Management page'),
                    ('access_project_configuration', 'Can access Project Configuration page'),
                    ('access_phase_configuration', 'Can access Phase Configuration page'),
                ],
            },
        ),
        migrations.RunPython(create_all_timesheet_logs_permission, migrations.RunPython.noop),
    ]
