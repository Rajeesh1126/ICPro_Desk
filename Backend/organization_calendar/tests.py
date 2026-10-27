from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
import json
import tempfile
from rest_framework.test import APITestCase

from users.models import Role, UserProfile
from .models import CalendarEntry

User = get_user_model()


class CalendarEntryTests(APITestCase):
    url = '/api/calendar/entries/'

    def setUp(self):
        media = tempfile.TemporaryDirectory()
        self.addCleanup(media.cleanup)
        override = self.settings(MEDIA_ROOT=media.name)
        override.enable()
        self.addCleanup(override.disable)
        role = Role.objects.create(name='Calendar editor')
        role.permissions.set(Permission.objects.filter(
            content_type__app_label='organization_calendar',
        ))
        self.owner = User.objects.create_user(username='organizer')
        self.other = User.objects.create_user(username='participant')
        for user in [self.owner, self.other]:
            UserProfile.objects.create(user=user, role=role)
        self.client.force_authenticate(self.owner)
        self.payload = {
            'title': 'Organization meeting', 'entry_type': 'meeting',
            'start_at': '2026-10-23T10:00:00+05:30',
            'end_at': '2026-10-23T11:00:00+05:30',
            'participants': [self.other.pk],
        }

    def create_entry(self):
        response = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        return response.data

    def test_create_all_entry_types_and_server_owned_creator(self):
        for entry_type in ['meeting', 'event', 'task']:
            with self.subTest(entry_type=entry_type):
                self.payload.update(entry_type=entry_type, created_by=self.other.pk)
                data = self.create_entry()
                self.assertEqual(data['created_by'], self.owner.pk)
                self.assertEqual(data['participants'], [self.other.pk])

    def test_entries_are_visible_organization_wide(self):
        data = self.create_entry()
        self.client.force_authenticate(self.other)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['id'] for item in response.data], [data['id']])

    def test_non_owner_cannot_edit_or_delete(self):
        data = self.create_entry()
        self.client.force_authenticate(self.other)
        url = f"{self.url}{data['id']}/"
        self.assertEqual(self.client.patch(url, {'title': 'Changed'}).status_code, 403)
        self.assertEqual(self.client.delete(url).status_code, 403)

    def test_owner_can_update_complete_and_delete(self):
        data = self.create_entry()
        url = f"{self.url}{data['id']}/"
        response = self.client.patch(url, {'status': 'completed'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'completed')
        self.assertEqual(self.client.delete(url).status_code, 204)

    def test_admin_can_edit_another_organizers_entry(self):
        data = self.create_entry()
        self.other.is_superuser = True
        self.other.save(update_fields=['is_superuser'])
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.patch(
            f"{self.url}{data['id']}/", {'status': 'cancelled'},
        ).status_code, 200)

    def test_invalid_times_rejected_on_create_and_partial_update(self):
        data = self.create_entry()
        self.assertEqual(self.client.patch(
            f"{self.url}{data['id']}/", {'end_at': self.payload['start_at']},
        ).status_code, 400)
        self.payload['end_at'] = self.payload['start_at']
        self.assertEqual(self.client.post(self.url, self.payload, format='json').status_code, 400)

    def test_overlap_range_and_filters(self):
        data = self.create_entry()
        response = self.client.get(self.url, {
            'start': '2026-10-23T10:30:00+05:30',
            'end': '2026-10-23T10:45:00+05:30',
            'entry_type': 'meeting', 'participant_id': self.other.pk,
            'created_by': self.owner.pk, 'status': 'scheduled', 'search': 'Organization',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['id'] for item in response.data], [data['id']])
        response = self.client.get(self.url, {'start': self.payload['end_at']})
        self.assertEqual(response.data, [])
        self.assertEqual(self.client.get(self.url, {'entry_type': 'task'}).data, [])

    def test_invalid_filters_return_validation_errors(self):
        for query in [
            {'start': 'invalid'}, {'participant_id': 'invalid'}, {'status': 'invalid'},
            {'start': self.payload['end_at'], 'end': self.payload['start_at']},
        ]:
            with self.subTest(query=query):
                self.assertEqual(self.client.get(self.url, query).status_code, 400)

    def test_inactive_participant_rejected(self):
        self.other.is_active = False
        self.other.save(update_fields=['is_active'])
        self.assertEqual(self.client.post(self.url, self.payload, format='json').status_code, 400)

    def test_role_permission_required(self):
        self.owner.profile.role.permissions.clear()
        self.assertEqual(self.client.get(self.url).status_code, 403)
        self.assertEqual(self.client.post(self.url, self.payload, format='json').status_code, 403)

    def test_unauthenticated_access_rejected(self):
        self.client.force_authenticate(user=None)
        self.assertIn(self.client.get(self.url).status_code, [401, 403])

    def upload_entry(self):
        response = self.client.post(self.url, {
            'payload': json.dumps(self.payload),
            'attachments': [SimpleUploadedFile('reference.txt', b'Meeting reference')],
        }, format='multipart')
        self.assertEqual(response.status_code, 201, response.data)
        return response.data

    def test_upload_and_read_reference_files(self):
        data = self.upload_entry()
        self.assertEqual(data['files'][0]['name'], 'reference.txt')
        self.assertIn('/media/calendar/attachments/', data['files'][0]['file'])
        self.client.force_authenticate(self.other)
        response = self.client.get(f"{self.url}{data['id']}/")
        self.assertEqual(response.data['files'], data['files'])

    def test_edit_adds_files_and_preserves_empty_participant_list(self):
        data = self.upload_entry()
        response = self.client.patch(f"{self.url}{data['id']}/", {
            'payload': json.dumps({'participants': []}),
            'attachments': [SimpleUploadedFile('notes.pdf', b'%PDF-1.4 test')],
        }, format='multipart')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(len(response.data['files']), 2)
        self.assertEqual(response.data['participants'], [])

    def test_remove_file_deletes_stored_content(self):
        data = self.upload_entry()
        entry = CalendarEntry.objects.get(pk=data['id'])
        attachment = entry.files.get()
        storage, name = attachment.file.storage, attachment.file.name
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(f"{self.url}{entry.pk}/", {
                'remove_attachment_ids': [attachment.pk],
            }, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['files'], [])
        self.assertFalse(storage.exists(name))

    def test_non_owner_cannot_remove_attachment(self):
        data = self.upload_entry()
        self.client.force_authenticate(self.other)
        response = self.client.patch(f"{self.url}{data['id']}/", {
            'remove_attachment_ids': [data['files'][0]['id']],
        }, format='json')
        self.assertEqual(response.status_code, 403)

    def test_invalid_file_and_payload_are_rejected(self):
        response = self.client.post(self.url, {
            'payload': json.dumps(self.payload),
            'attachments': [SimpleUploadedFile('script.html', b'<script></script>')],
        }, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(CalendarEntry.objects.exists())
        response = self.client.post(self.url, {'payload': '{invalid'}, format='multipart')
        self.assertEqual(response.status_code, 400)

    def test_file_limit_and_cross_entry_removal(self):
        data = self.upload_entry()
        other = self.create_entry()
        response = self.client.patch(f"{self.url}{other['id']}/", {
            'remove_attachment_ids': [data['files'][0]['id']],
        }, format='json')
        self.assertEqual(response.status_code, 400)
        response = self.client.post(self.url, {
            'payload': json.dumps(self.payload),
            'attachments': [SimpleUploadedFile(f'file{i}.txt', b'reference') for i in range(11)],
        }, format='multipart')
        self.assertEqual(response.status_code, 400)

    def test_delete_entry_cleans_up_files(self):
        data = self.upload_entry()
        attachment = CalendarEntry.objects.get(pk=data['id']).files.get()
        storage, name = attachment.file.storage, attachment.file.name
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(f"{self.url}{data['id']}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(storage.exists(name))
