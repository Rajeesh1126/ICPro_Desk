from django.conf import settings
from django.db import models
from django.db import transaction
from django.db.models.signals import post_delete
from django.dispatch import receiver
from pathlib import Path
from uuid import uuid4


class CalendarEntry(models.Model):
    class EntryType(models.TextChoices):
        EVENT = 'event', 'Event'
        CELEBRATION = 'celebration', 'Celebration'
        HOLYDAY = 'holiday', 'Holiday'
        OTHERS = 'others', 'Others'



    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    entry_type = models.CharField(max_length=25, choices=EntryType.choices, default=EntryType.EVENT)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SCHEDULED)
    start_at = models.DateTimeField(db_index=True ,default=None, null=True)
    end_at = models.DateTimeField(db_index=True,default=None, null=True)
    event_date = models.DateField(db_index=True, default=None, null=True)
    all_day = models.BooleanField(default=False)
    location = models.CharField(max_length=255, blank=True, default='')
    meeting_url = models.URLField(max_length=500, blank=True, default='')
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name='calendar_entries',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_calendar_entries',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_at', 'id']
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_at__gt=models.F('start_at')),
                name='calendar_entry_end_after_start',
            ),
        ]

    def __str__(self):
        return self.title


def calendar_attachment_path(instance, filename):
    return f'calendar/attachments/{uuid4().hex}{Path(filename).suffix.lower()}'


class CalendarAttachment(models.Model):
    entry = models.ForeignKey(CalendarEntry, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to=calendar_attachment_path)
    name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']


@receiver(post_delete, sender=CalendarAttachment)
def delete_calendar_attachment_file(sender, instance, **kwargs):
    if instance.file:
        storage, name = instance.file.storage, instance.file.name
        transaction.on_commit(lambda: storage.delete(name))
