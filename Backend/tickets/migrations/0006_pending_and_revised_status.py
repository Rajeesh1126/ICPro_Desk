from django.db import migrations, models


STATUS_CHOICES = [
    ('open', 'Open'),
    ('accepted', 'Accepted'),
    ('on hold', 'On Hold'),
    ('pending', 'Pending'),
    ('in progress', 'In Progress'),
    ('feedback provided', 'Feedback Provided'),
    ('completed', 'Completed'),
    ('closed', 'Closed'),
    ('rejected', 'Rejected'),
    ('recall requested', 'Recall Requested'),
    ('recall successful', 'Recall Successful'),
    ('date revision', 'Target Date Revision Requested'),
    ('revised', 'Revised'),
    ('not-satisfied', 'Not-Satisfied'),
    ('cancelled', 'Cancelled'),
]


def rename_status(apps, schema_editor, old, new):
    for model_name, field in [('Ticket', 'current_status'), ('Self_Ticket', 'current_status'), ('Ticket_Log', 'status')]:
        model = apps.get_model('tickets', model_name)
        model.objects.using(schema_editor.connection.alias).filter(**{field: old}).update(**{field: new})


def forwards(apps, schema_editor):
    rename_status(apps, schema_editor, 'modified', 'revised')


def backwards(apps, schema_editor):
    rename_status(apps, schema_editor, 'revised', 'modified')


class Migration(migrations.Migration):
    dependencies = [('tickets', '0005_add_target_date_revision_status')]

    operations = [
        migrations.RunPython(forwards, backwards),
        migrations.AlterField(
            model_name='ticket', name='current_status',
            field=models.CharField(choices=STATUS_CHOICES, default='open', max_length=20),
        ),
        migrations.AlterField(
            model_name='self_ticket', name='current_status',
            field=models.CharField(choices=STATUS_CHOICES, default='open', max_length=20),
        ),
        migrations.AlterField(
            model_name='ticket_log', name='status',
            field=models.CharField(choices=STATUS_CHOICES, max_length=20),
        ),
    ]
