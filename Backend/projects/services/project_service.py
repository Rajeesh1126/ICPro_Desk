from django.db import transaction

from ..models import AssignedTask, Milestone, Task


def _first_present(*values, default=None):
    for value in values:
        if value not in (None, ''):
            return value
    return default


def _cost_master_category(cost_master):
    category = getattr(cost_master, 'cost_category', None)
    if category is None:
        return None, None

    return getattr(category, 'id', None), getattr(category, 'name', None)


@transaction.atomic
def create_project_milestones_tasks_and_assignments(project, quotation, assign_to = None, assign_by=None):
    """
    Create missing milestones, tasks, and assigned tasks from ERP quotation costs.

    A QuotationCost row becomes one Task. The milestone is grouped by the
    CostMaster category when available, otherwise by quotation cost grouping
    fields from ERP.
    """
    quotation_costs = (
        quotation.quotationcost_set
        .select_related('cost__cost_category')
        .filter(cost__isnull=False)
        .all()
    )

    for quotation_cost in quotation_costs:
        cost = quotation_cost.cost
        category_id, category_name = _cost_master_category(cost)

        milestone_name = _first_present(
            category_name,
            default='General',
        )
        milestone_lookup = {'project': project}
        if category_id is not None:
            milestone_lookup['category'] = category_id
        else:
            milestone_lookup['name'] = milestone_name

        milestone, created = Milestone.objects.get_or_create(
            **milestone_lookup,
            defaults={
                'category': category_id,
                'name': milestone_name,
            },
        )
        if not created and milestone.name != milestone_name:
            milestone.name = milestone_name
            milestone.save(update_fields=['name'])

        task_name = _first_present(
            quotation_cost.cost_name,
            quotation_cost.description,
            default=f'Cost #{cost.id}',
        )
        task, _ = Task.objects.get_or_create(
            project=project,
            milestone=milestone,
            cost=quotation_cost.id,
            defaults={
                'name': task_name,
                'description': quotation_cost.description,
            },
        )

        if assign_to:
            AssignedTask.objects.get_or_create(
                project_obj=project,
                milestone_obj=milestone,
                task_obj=task,
                assign_to=assign_to,
                defaults={'assign_by': assign_by},
            )


def create_project_milestones_and_tasks(project, quotation, assign_to=None, assign_by=None):
    return create_project_milestones_tasks_and_assignments(project, quotation, assign_to, assign_by)
