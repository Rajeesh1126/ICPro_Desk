from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from rest_framework import status
from rest_framework.test import APITestCase

from .models import DepartmentManager, Role, UserProfile

User = get_user_model()


class PasswordAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='tester',
            email='tester@example.com',
            password='OldPass123!',
        )
        UserProfile.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)

    def test_change_password(self):
        response = self.client.post('/api/users/change-password/', {
            'old_password': 'OldPass123!',
            'new_password': 'NewPass123!',
            'confirm_password': 'NewPass123!',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass123!'))

    def test_forgot_password_sends_email(self):
        response = self.client.post('/api/users/forgot-password/', {
            'email': self.user.email,
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

    def test_reset_password_with_token(self):
        token = default_token_generator.make_token(self.user)
        response = self.client.post('/api/users/reset-password/', {
            'email': self.user.email,
            'token': token,
            'new_password': 'ResetPass123!',
            'confirm_password': 'ResetPass123!',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('ResetPass123!'))

    def test_create_user_with_password(self):
        add_permission = Permission.objects.get(codename='add_user')
        role = Role.objects.create(name='Admin')
        role.permissions.add(add_permission)
        self.user.profile.role = role
        self.user.profile.save()

        response = self.client.post('/api/users/', {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'CreatePass123!',
            'first_name': 'New',
            'last_name': 'User',
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_user = User.objects.get(username='newuser')
        self.assertTrue(created_user.check_password('CreatePass123!'))

    def test_user_without_permission_cannot_list_users(self):
        response = self.client.get('/api/users/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_with_view_permission_can_list_users(self):
        view_permission = Permission.objects.get(codename='view_user')
        role = Role.objects.create(name='Viewer')
        role.permissions.add(view_permission)
        self.user.profile.role = role
        self.user.profile.save()

        response = self.client.get('/api/users/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_current_user_groups_returns_user_and_managed_departments(self):
        group = Group.objects.create(name='Engineering')
        managed_department = Group.objects.create(name='Operations')
        teammate = User.objects.create_user(username='teammate', email='team@example.com')

        self.user.groups.add(group)
        teammate.groups.add(managed_department)
        DepartmentManager.objects.create(
            department=managed_department,
            manager=self.user,
        )

        response = self.client.get('/api/users/currentUserGroups/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertCountEqual(
            response.data['department_ids'],
            [group.id, managed_department.id],
        )
        self.assertCountEqual(
            [department['name'] for department in response.data['departments']],
            ['Engineering', 'Operations'],
        )
        self.assertEqual(
            response.data['managed_departments'][0]['name'],
            'Operations',
        )
        self.assertTrue(
            any(user['username'] == 'teammate' for user in response.data['userslist'])
        )

    def test_permissions_endpoint_returns_only_business_view_permissions(self):
        session_content_type = ContentType.objects.get(app_label='sessions', model='session')
        Permission.objects.get_or_create(
            content_type=session_content_type,
            codename='view_session',
            defaults={'name': 'Can view session'},
        )

        response = self.client.get('/api/permissions/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(item['codename'].startswith('view_') for item in response.data))
        self.assertNotIn('sessions', {item['app_label'] for item in response.data})
        self.assertNotIn('contenttypes', {item['app_label'] for item in response.data})
