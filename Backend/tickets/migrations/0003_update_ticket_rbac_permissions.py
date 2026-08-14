# Generated manually because Django is not installed in the current shell.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("tickets", "0002_remove_self_ticket_comments"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="ticket",
            options={
                "default_permissions": (),
                "permissions": [
                    ("view_ticket", "Handle View Ticket"),
                    ("add_ticket", "Handle Create Ticket"),
                    ("change_ticket", "Handle Change Ticket"),
                    ("delete_ticket", "Handle Delete Ticket"),
                ],
            },
        ),
        migrations.AlterModelOptions(
            name="self_ticket",
            options={
                "default_permissions": (),
                "permissions": [
                    ("view_self_tickets", "Handle Self Ticket"),
                    ("add_self_ticket", "Handle Create Self Ticket"),
                    ("change_self_ticket", "Handle Change Self Ticket"),
                    ("delete_self_ticket", "Handle Delete Self Ticket"),
                    ("view_managementoverview", "Handle Management Overview"),
                    ("view_report", "Handle Ticket Report"),
                ],
            },
        ),
    ]
