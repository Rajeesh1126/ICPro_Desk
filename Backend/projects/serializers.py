from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from erp.models import CostMaster, Quotation
from erp.models import CostCategory
from .models import AssignedTask, Milestone, Project, Task
from .models import Phases
from .services.project_service import (
    create_milestones_tasks_and_assignments_from_cost_masters,
    create_project_milestones_tasks_and_assignments,
)

User = get_user_model()


UNDEFINED_PROJECT_CODE_PREFIX = 'ICP/UN/'


def generate_undefined_project_code():
    existing_codes = (
        Project.objects
        .filter(code__startswith=UNDEFINED_PROJECT_CODE_PREFIX)
        .values_list('code', flat=True)
    )
    existing_numbers = []

    for code in existing_codes:
        try:
            existing_numbers.append(int(code.replace(UNDEFINED_PROJECT_CODE_PREFIX, '')))
        except ValueError:
            continue

    next_number = (max(existing_numbers) if existing_numbers else 0) + 1

    return f'{UNDEFINED_PROJECT_CODE_PREFIX}{next_number:04d}'


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'code', 'quotation_id', 'description','customer']

    @transaction.atomic
    def create(self, validated_data):
        code = validated_data.get('code')
        quotation_id = validated_data.get('quotation_id')
        customer = validated_data.get('customer')
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
        elif not code:
            code = generate_undefined_project_code()
            while Project.objects.filter(code__iexact=code).exists():
                code = generate_undefined_project_code()
            validated_data['code'] = code

        # Check existing project by code
        existing_project = Project.objects.filter(
            code__iexact=code
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


class PhaseSerializer(serializers.ModelSerializer):
    cost_category_name = serializers.SerializerMethodField()

    class Meta:
        model = Phases
        fields = ['id', 'phase', 'cost_category', 'cost_category_name']

    def validate(self, attrs):
        phase = attrs.get('phase', getattr(self.instance, 'phase', None))
        cost_category = attrs.get('cost_category', getattr(self.instance, 'cost_category', None))

        if phase and cost_category:
            duplicate_query = Phases.objects.filter(phase=phase, cost_category=cost_category)
            if self.instance:
                duplicate_query = duplicate_query.exclude(pk=self.instance.pk)

            if duplicate_query.exists():
                raise serializers.ValidationError(
                    {'cost_category': 'This CostCategory is already mapped to the selected phase.'}
                )

        return attrs

    def get_cost_category_name(self, obj):
        if not obj.cost_category:
            return None

        try:
            cost_category = CostCategory.objects.filter(id=obj.cost_category).first()
        except Exception:
            return None

        return cost_category.name if cost_category else None


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

    def update(self, instance, validated_data):
        assign_by_updated = 'assign_by' in validated_data
        instance = super().update(instance, validated_data)

        if assign_by_updated:
            from api.models import Submission

            Submission.objects.filter(assignId=instance).update(approvedBy=instance.assign_by)

        return instance


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
