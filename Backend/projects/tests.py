from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import AssignedTask, Phases, Project

User = get_user_model()


class ProjectAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='project_user',
            email='project@example.com',
            password='Pass123!',
            is_staff=True,
        )
        self.client.force_authenticate(user=self.user)

    def test_undefined_project_create_generates_unique_code_without_assignment(self):
        first_response = self.client.post(
            '/api/projects/',
            {
                'description': 'Internal admin work - US-123',
                'customer': 'Internal',
            },
            format='json',
        )
        second_response = self.client.post(
            '/api/projects/',
            {
                'description': 'Training',
                'customer': 'Internal',
            },
            format='json',
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(first_response.data['code'], 'ICP/UN/0001')
        self.assertEqual(second_response.data['code'], 'ICP/UN/0002')
        self.assertFalse(
            AssignedTask.objects.filter(
                project_obj__in=Project.objects.filter(code__startswith='ICP/UN/')
            ).exists()
        )

    def test_existing_project_code_reuses_project(self):
        existing_project = Project.objects.create(
            code='Q-001',
            quotation_id=1,
            description='Original project',
        )

        response = self.client.post(
            '/api/projects/',
            {
                'code': 'Q-001',
                'quotation_id': 1,
                'description': 'Original project',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['id'], existing_project.id)
        self.assertEqual(Project.objects.filter(code='Q-001').count(), 1)

    def test_phase_mapping_allows_same_category_in_multiple_phases(self):
        create_response = self.client.post(
            '/api/phases/',
            {
                'phase': 'Sales',
                'cost_category': 101,
            },
            format='json',
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Phases.objects.filter(phase='Sales', cost_category=101).exists()
        )

        second_phase_response = self.client.post(
            '/api/phases/',
            {
                'phase': 'Execution',
                'cost_category': 101,
            },
            format='json',
        )

        self.assertEqual(second_phase_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Phases.objects.filter(phase='Execution', cost_category=101).exists()
        )

        duplicate_response = self.client.post(
            '/api/phases/',
            {
                'phase': 'Sales',
                'cost_category': 101,
            },
            format='json',
        )

        self.assertEqual(duplicate_response.status_code, status.HTTP_400_BAD_REQUEST)
