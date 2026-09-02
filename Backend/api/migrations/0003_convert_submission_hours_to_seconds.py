from django.db import migrations


def convert_hours_to_seconds(apps, schema_editor):
    Submission = apps.get_model('api', 'Submission')

    for submission in Submission.objects.filter(hours__gt=0, hours__lte=24):
        submission.hours = submission.hours * 3600
        submission.save(update_fields=['hours'])


def convert_seconds_to_hours(apps, schema_editor):
    Submission = apps.get_model('api', 'Submission')

    for submission in Submission.objects.filter(hours__gt=0):
        if submission.hours % 3600 == 0:
            submission.hours = submission.hours // 3600
            submission.save(update_fields=['hours'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_timesheetstatus_timesheet_status'),
    ]

    operations = [
        migrations.RunPython(convert_hours_to_seconds, convert_seconds_to_hours),
    ]
