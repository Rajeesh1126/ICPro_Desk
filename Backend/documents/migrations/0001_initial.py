# Generated for document template, lesson learnt, and system suggestion records.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="DocumentTemplate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("document_name", models.CharField(max_length=150)),
                ("document_type", models.CharField(choices=[("FDS", "FDS"), ("SDS", "SDS"), ("Template", "Template"), ("Other", "Other")], db_index=True, default="Template", max_length=20)),
                ("version", models.CharField(blank=True, default="", max_length=20)),
                ("description", models.TextField(blank=True, default="")),
                ("file", models.FileField(upload_to="documents/templates/")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                ("uploaded_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="uploaded_document_templates", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-updated_at", "document_name"],
            },
        ),
        migrations.CreateModel(
            name="LessonLearnt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("project", models.CharField(max_length=150)),
                ("category", models.CharField(max_length=100)),
                ("event", models.TextField()),
                ("limitations", models.TextField(blank=True, default="")),
                ("actions", models.TextField(blank=True, default="")),
                ("remarks", models.TextField(blank=True, default="")),
                ("status", models.CharField(choices=[("Draft", "Draft"), ("Shared", "Shared"), ("Reviewed", "Reviewed"), ("Archived", "Archived")], db_index=True, default="Shared", max_length=20)),
                ("file", models.FileField(blank=True, null=True, upload_to="documents/lessons/")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lesson_learnt_logs", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="SystemSuggestion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("suggestion", models.TextField()),
                ("status", models.CharField(choices=[("Open", "Open"), ("In Review", "In Review"), ("Accepted", "Accepted"), ("Rejected", "Rejected"), ("Closed", "Closed")], db_index=True, default="Open", max_length=20)),
                ("remarks", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="system_suggestions", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
