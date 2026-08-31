from datetime import timedelta

from django.utils import timezone
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


def _current_iso_week_dates():
    today = timezone.localdate()
    start_date = today - timedelta(days=today.weekday())
    end_date = start_date + timedelta(days=6)
    return start_date, end_date


def _assignment_defaults(assign_by):
    start_date, end_date = _current_iso_week_dates()
    return {
        'assign_by': assign_by,
        'start_date': start_date,
        'end_date': end_date,
    }


def _assign_project_without_task(project, assign_to=None, assign_by=None):
    if not assign_to:
        return

    AssignedTask.objects.get_or_create(
        project_obj=project,
        milestone_obj=None,
        task_obj=None,
        assign_to=assign_to,
        defaults=_assignment_defaults(assign_by),
    )


@transaction.atomic
def create_project_milestones_tasks_and_assignments(project, quotation, assign_to = None, assign_by=None):
    """
    Create missing milestones, tasks, and assigned tasks from ERP quotation costs.

    A QuotationCost row becomes one Task. The milestone is grouped by the
    CostMaster category when available, otherwise by quotation cost grouping
    fields from ERP.
    """
    quotation_costs = list(
        quotation.quotationcost_set
        .select_related('cost__cost_category')
        .filter(cost__isnull=False)
        .all()
    )

    if not quotation_costs:
        _assign_project_without_task(project, assign_to=assign_to, assign_by=assign_by)
        return

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
            # quotation_cost.description,
            default=f'Cost #{cost.id}',
        )
        task, _ = Task.objects.get_or_create(
            project=project,
            milestone=milestone,
            cost=quotation_cost.id,
            defaults={
                'name': task_name,
                # 'description': quotation_cost.description,
            },
        )

        if assign_to:
            AssignedTask.objects.get_or_create(
                project_obj=project,
                milestone_obj=milestone,
                task_obj=task,
                assign_to=assign_to,
                defaults=_assignment_defaults(assign_by),
            )


def create_project_milestones_and_tasks(project, quotation, assign_to=None, assign_by=None):
    return create_project_milestones_tasks_and_assignments(project, quotation, assign_to, assign_by)


@transaction.atomic
def create_milestones_tasks_and_assignments_from_cost_masters(
    project,
    cost_masters,
    assign_to=None,
    assign_by=None,
):
    """
    Add non-quotation tasks to an existing project from ERP CostMaster rows.

    CostCategory becomes the milestone and CostMaster becomes the task. Existing
    project milestones, tasks, and assignments are reused.
    """
    result = {
        'milestones_created': 0,
        'tasks_created': 0,
        'assignments_created': 0,
    }

    for cost_master in cost_masters:
        category_id, category_name = _cost_master_category(cost_master)
        milestone_name = _first_present(category_name, default='General')

        milestone_lookup = {'project': project}
        if category_id is not None:
            milestone_lookup['category'] = category_id
        else:
            milestone_lookup['name'] = milestone_name

        milestone, milestone_created = Milestone.objects.get_or_create(
            **milestone_lookup,
            defaults={
                'category': category_id,
                'name': milestone_name,
            },
        )
        if milestone_created:
            result['milestones_created'] += 1
        elif milestone.name != milestone_name:
            milestone.name = milestone_name
            milestone.save(update_fields=['name'])

        task_name = _first_present(
            getattr(cost_master, 'name', None),
            default=f'Cost #{cost_master.id}',
        )
        task, task_created = Task.objects.get_or_create(
            project=project,
            milestone=milestone,
            cost=cost_master.id,
            defaults={'name': task_name},
        )
        if task_created:
            result['tasks_created'] += 1
        elif task.name != task_name:
            task.name = task_name
            task.save(update_fields=['name'])

        if assign_to:
            _, assignment_created = AssignedTask.objects.get_or_create(
                project_obj=project,
                milestone_obj=milestone,
                task_obj=task,
                assign_to=assign_to,
                defaults=_assignment_defaults(assign_by),
            )
            if assignment_created:
                result['assignments_created'] += 1

    return result
