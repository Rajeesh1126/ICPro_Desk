from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
        ('api', '0009_alter_assignedtask_milestone_obj_and_more'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AlterField(
                    model_name='submission',
                    name='assignId',
                    field=models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, to='projects.assignedtask'),
                ),
                migrations.DeleteModel(name='AssignedTask'),
                migrations.DeleteModel(name='Task'),
                migrations.DeleteModel(name='Milestone'),
                migrations.DeleteModel(name='Project'),
            ],
        ),
    ]

