from django.conf import settings
from django.db import models


class DocumentTemplate(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ("FDS", "FDS"),
        ("SDS", "SDS"),
        ("Template", "Template"),
        ("Other", "Other"),
    ]

    document_name = models.CharField(max_length=150)
    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPE_CHOICES,
        default="Template",
        db_index=True,
    )
    version = models.CharField(max_length=20, blank=True, default="")
    description = models.TextField(blank=True, default="")
    file = models.FileField(upload_to="documents/templates/")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="uploaded_document_templates",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["-updated_at", "document_name"]

    def __str__(self):
        return f"{self.document_name} {self.version}".strip()

    def delete(self, *args, **kwargs):
        if self.file:
            self.file.delete(save=False)
        super().delete(*args, **kwargs)


class LessonLearnt(models.Model):
    STATUS_CHOICES = [
        ("Draft", "Draft"),
        ("Shared", "Shared"),
        ("Reviewed", "Reviewed"),
        ("Archived", "Archived"),
    ]

    project = models.CharField(max_length=150)
    category = models.CharField(max_length=100)
    event = models.TextField()
    limitations = models.TextField(blank=True, default="")
    actions = models.TextField(blank=True, default="")
    remarks = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Shared",
        db_index=True,
    )
    file = models.FileField(
        upload_to="documents/lessons/",
        blank=True,
        null=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lesson_learnt_logs",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.project} - {self.category}"

    def delete(self, *args, **kwargs):
        if self.file:
            self.file.delete(save=False)
        super().delete(*args, **kwargs)


class SystemSuggestion(models.Model):
    STATUS_CHOICES = [
        ("Open", "Open"),
        ("In Review", "In Review"),
        ("Accepted", "Accepted"),
        ("Rejected", "Rejected"),
        ("Closed", "Closed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="system_suggestions",
        db_index=True,
    )
    suggestion = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Open",
        db_index=True,
    )
    remarks = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.status}"
