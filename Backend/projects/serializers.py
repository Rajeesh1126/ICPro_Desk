from django.contrib.auth import get_user_model
from rest_framework import serializers

from erp.models import CostMaster, Quotation
from .models import AssignedTask, Milestone, Project, Task
from .services.project_service import (
    create_milestones_tasks_and_assignments_from_cost_masters,
    create_project_milestones_tasks_and_assignments,
)

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'quotation_id', 'description']

    def create(self, validated_data):
        name = validated_data.get('name')
        quotation_id = validated_data.get('quotation_id')
        request = self.context.get('request')
        requested_user = request.user if request and request.user and request.user.is_authenticated else None
        reporting_manager = None

        if requested_user:
            reporting_manager = getattr(getattr(requested_user, 'profile', None), 'reporting_to', None)

        quotation = None
        if quotation_id:
            try:
                quotation = Quotation.objects.get(id=quotation_id)
            except Quotation.DoesNotExist as exc:
                raise serializers.ValidationError({'quotation_id': 'Quotation not found in ERP.'}) from exc

        # Check existing project by name
        existing_project = Project.objects.filter(
            name__iexact=name
        ).first()

        # No existing project -> create new
        if not existing_project:
            project = Project.objects.create(**validated_data)

            if quotation and requested_user:
                create_project_milestones_tasks_and_assignments(
                    project=project,
                    quotation=quotation,
                    assign_to=requested_user,
                    assign_by=reporting_manager,
                )

            return project

        # Same quotation -> skip
        if existing_project.quotation_id == quotation_id:
            if quotation and requested_user:
                create_project_milestones_tasks_and_assignments(
                    project=existing_project,
                    quotation=quotation,
                    assign_to=requested_user,
                    assign_by=reporting_manager,
                )

            return existing_project

        # New quotation is higher -> update
        if quotation_id and (existing_project.quotation_id is None or quotation_id > existing_project.quotation_id):
            existing_project.quotation_id = quotation_id

            if 'description' in validated_data:
                existing_project.description = validated_data['description']

            existing_project.save()

            if quotation and requested_user:
                create_project_milestones_tasks_and_assignments(
                    project=existing_project,
                    quotation=quotation,
                    assign_to=requested_user,
                    assign_by=reporting_manager,
                )

            return existing_project

        if quotation and requested_user:
            create_project_milestones_tasks_and_assignments(
                project=existing_project,
                quotation=quotation,
                assign_to=requested_user,
                assign_by=reporting_manager,
            )

        return existing_project


class TaskSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    milestone = serializers.PrimaryKeyRelatedField(queryset=Milestone.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Task
        fields = ['id', 'project', 'cost', 'name', 'description', 'milestone']


class MilestoneSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())

    class Meta:
        model = Milestone
        fields = ['id', 'project', 'category', 'name']


class AssignedTaskSerializer(serializers.ModelSerializer):
    assign_by = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all(), allow_null=True)
    assign_to = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all(), allow_null=True)
    project_obj = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), required=False, allow_null=True)
    task_obj = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all(), required=False, allow_null=True)
    milestone_obj = serializers.PrimaryKeyRelatedField(queryset=Milestone.objects.all(), required=False, allow_null=True)

    class Meta:
        model = AssignedTask
        fields = [
            'id', 'assign_by', 'assign_to', 'project_obj', 'task_obj', 'milestone_obj',
            'start_date', 'end_date', 'created_date', 'updated_date',
        ]


class AddCostMasterTasksSerializer(serializers.Serializer):
    cost_master_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )

    def validate_cost_master_ids(self, value):
        unique_ids = list(dict.fromkeys(value))
        cost_masters = list(
            CostMaster.objects
            .select_related('cost_category')
            .filter(id__in=unique_ids)
        )
        found_ids = {cost_master.id for cost_master in cost_masters}
        missing_ids = [cost_master_id for cost_master_id in unique_ids if cost_master_id not in found_ids]

        if missing_ids:
            raise serializers.ValidationError(f'CostMaster ids not found in ERP: {missing_ids}')

        self.cost_masters = cost_masters
        return unique_ids

    def save(self, **kwargs):
        request = self.context.get('request')
        project = self.context['project']
        requested_user = request.user if request and request.user and request.user.is_authenticated else None
        reporting_manager = None

        if requested_user:
            reporting_manager = getattr(getattr(requested_user, 'profile', None), 'reporting_to', None)

        return create_milestones_tasks_and_assignments_from_cost_masters(
            project=project,
            cost_masters=self.cost_masters,
            assign_to=requested_user,
            assign_by=reporting_manager,
        )
