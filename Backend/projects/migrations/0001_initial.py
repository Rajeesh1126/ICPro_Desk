from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.CreateModel(
                    name='Project',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('quotation', models.CharField(blank=True, db_index=True, max_length=25, null=True)),
                        ('name', models.CharField(db_index=True, max_length=255)),
                        ('system_name', models.CharField(blank=True, db_index=True, max_length=255, null=True)),
                        ('customer_name', models.CharField(blank=True, db_index=True, max_length=255, null=True)),
                        ('customer_code', models.CharField(blank=True, db_index=True, max_length=20, null=True)),
                        ('quoted_date', models.DateField(blank=True, db_index=True, null=True)),
                    ],
                    options={
                        'db_table': 'api_project',
                    },
                ),
                migrations.CreateModel(
                    name='Milestone',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('name', models.CharField(db_index=True, max_length=255)),
                        ('project', models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name='milestones', to='projects.project')),
                    ],
                    options={
                        'db_table': 'api_milestone',
                    },
                ),
                migrations.CreateModel(
                    name='Task',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('name', models.CharField(db_index=True, max_length=255)),
                        ('description', models.TextField(blank=True, null=True)),
                        ('milestone', models.ForeignKey(blank=True, db_index=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to='projects.milestone')),
                        ('project', models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to='projects.project')),
                    ],
                    options={
                        'db_table': 'api_task',
                    },
                ),
                migrations.CreateModel(
                    name='AssignedTask',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('start_date', models.DateField(blank=True, db_index=True, null=True)),
                        ('end_date', models.DateField(blank=True, db_index=True, null=True)),
                        ('created_date', models.DateTimeField(auto_now_add=True, db_index=True)),
                        ('updated_date', models.DateTimeField(auto_now=True)),
                        ('assign_by', models.ForeignKey(db_index=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_tasks', to=settings.AUTH_USER_MODEL)),
                        ('assign_to', models.ForeignKey(db_index=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tasks', to=settings.AUTH_USER_MODEL)),
                        ('milestone_obj', models.ForeignKey(blank=True, db_index=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assigned_tasks', to='projects.milestone')),
                        ('project_obj', models.ForeignKey(blank=True, db_index=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assigned_tasks', to='projects.project')),
                        ('task_obj', models.ForeignKey(blank=True, db_index=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assigned_tasks', to='projects.task')),
                    ],
                    options={
                        'db_table': 'api_assignedtask',
                        'ordering': ['-created_date'],
                        'indexes': [
                            models.Index(fields=['assign_to', 'project_obj'], name='projects_as_assign__d8461f_idx'),
                            models.Index(fields=['assign_by'], name='projects_as_assign__20ec98_idx'),
                            models.Index(fields=['start_date', 'end_date'], name='projects_as_start_d_68a043_idx'),
                        ],
                    },
                ),
            ],
        ),
    ]

