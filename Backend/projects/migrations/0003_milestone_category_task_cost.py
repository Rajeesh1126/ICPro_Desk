from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_remove_project_quotation_project_description_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='milestone',
            name='category',
            field=models.BigIntegerField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='task',
            name='cost',
            field=models.BigIntegerField(blank=True, db_index=True, null=True),
        ),
    ]

