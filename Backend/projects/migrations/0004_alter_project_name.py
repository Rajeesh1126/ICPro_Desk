from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0003_milestone_category_task_cost'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='name',
            field=models.CharField(blank=True, db_index=True, max_length=40, null=True),
        ),
    ]

