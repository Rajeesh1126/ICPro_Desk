from django.core.management.base import BaseCommand
from django.utils import timezone

from tickets.services.self_ticket_reminders import send_self_ticket_reminders


class Command(BaseCommand):
    help = 'Send due self-ticket reminder emails and set alarm flags.'

    def handle(self, *args, **options):
        reminded_tickets = send_self_ticket_reminders(timezone.localdate())
        self.stdout.write(
            self.style.SUCCESS(
                f'Self-ticket reminder job completed. {len(reminded_tickets)} reminder(s) triggered.'
            )
        )
