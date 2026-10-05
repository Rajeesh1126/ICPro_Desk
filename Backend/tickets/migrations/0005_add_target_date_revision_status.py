from django.db import migrations, models
from django.utils import timezone


STATUS_CHOICES = [
    ("open", "Open"),
    ("assigned", "Assigned"),
    ("accepted", "Accepted"),
    ("on hold", "On Hold"),
    ("in progress", "In Progress"),
    ("feedback provided", "Feedback Provided"),
    ("completed", "Completed"),
    ("closed", "Closed"),
    ("rejected", "Rejected"),
    ("recall requested", "Recall Requested"),
    ("recall successful", "Recall Successful"),
    ("date revision", "Target Date Revision Requested"),
    ("modified", "Modified"),
    ("not-satisfied", "Not-Satisfied"),
    ("cancelled", "Cancelled"),
]


class Migration(migrations.Migration):

    dependencies = [
        ("tickets", "0004_self_ticket_alarm"),
    ]

    operations = [
        migrations.AlterField(
            model_name="self_ticket",
            name="current_status",
            field=models.CharField(
                choices=STATUS_CHOICES,
                default="open",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="ticket",
            name="current_status",
            field=models.CharField(
                choices=STATUS_CHOICES,
                default="open",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="ticket",
            name="target_date",
            field=models.DateField(default=timezone.now),
        ),
        migrations.AlterField(
            model_name="ticket_log",
            name="status",
            field=models.CharField(choices=STATUS_CHOICES, max_length=20),
        ),
    ]
