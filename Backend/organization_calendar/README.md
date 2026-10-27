# Organization Calendar API

All endpoints use the existing JWT authentication and role permissions.
Entries are shared across the organization. Participants identify invitees for
meetings/events and assignees for tasks; they do not restrict visibility.

## Setup

Run `python manage.py migrate`. Assign the new `organization_calendar` model
permissions to roles through the existing role management:

- `view_calendarentry`: read all calendar entries.
- `add_calendarentry`: create entries.
- `change_calendarentry`: edit entries owned by the current user.
- `delete_calendarentry`: delete entries owned by the current user.

Staff and superusers can manage all entries using the existing admin convention.
The creator is always set by the server and cannot be changed through the API.

## Endpoints

| Method | URL | Action |
| --- | --- | --- |
| GET | `/api/calendar/entries/` | List entries |
| POST | `/api/calendar/entries/` | Create an entry |
| GET | `/api/calendar/entries/{id}/` | Read an entry |
| PUT / PATCH | `/api/calendar/entries/{id}/` | Update an entry |
| DELETE | `/api/calendar/entries/{id}/` | Delete an entry |

Example POST body:

```json
{
  "title": "Organization review meeting",
  "description": "Monthly project review",
  "entry_type": "meeting",
  "status": "scheduled",
  "start_at": "2026-10-26T10:00:00+05:30",
  "end_at": "2026-10-26T11:00:00+05:30",
  "all_day": false,
  "location": "Conference room",
  "meeting_url": "https://example.com/meeting",
  "participants": [12, 18]
}
```

Types: `event`, `meeting`, `task`. Statuses: `scheduled`, `completed`, `cancelled`.
Send `PATCH {"status": "completed"}` to complete a task or event, or
`PATCH {"status": "cancelled"}` to retain a cancelled entry in the calendar.
Participant IDs must belong to active users. An empty list means no named participants.

## Calendar Queries

Use ISO 8601 timestamps with explicit timezone offsets. Responses use the backend's
configured timezone (currently UTC). Clients should display timestamps in the
viewer's timezone.

`GET /api/calendar/entries/?start=2026-10-01T00:00:00Z&end=2026-11-01T00:00:00Z`

The range uses overlap semantics: `entry.end_at > start` and `entry.start_at < end`.
The end is exclusive. Entries spanning multiple days are included. For all-day
entries, supply local midnight timestamps, ending at midnight after the last day.
The end must always be strictly later than the start.

Optional filters: `entry_type`, `status`, `participant_id`, `created_by`, `search`.
Ordering: `ordering=start_at` (default), `-start_at`, `end_at`, `created_at`, or `title`.
Dates and filter choices are validated; invalid values return HTTP 400.

This initial API stores scheduling data only. It does not send invitations or
reminder emails, create Teams meetings, synchronize external calendars, or
expand recurring events. A meeting URL may be supplied manually.

## Reference Attachments

Create and update requests also accept multipart form data. Send `payload` as a
JSON string containing the usual entry fields and repeat the `attachments` file
field for each new upload. JSON requests without files continue to work.
This format preserves empty participant arrays and booleans.

Responses include `files`, an array of `{id, name, file, uploaded_at}` objects;
`file` is the URL used to open or download the attachment. Files follow the
existing application's media hosting configuration.

Supported extensions: PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, CSV, ZIP, PNG, JPG/JPEG.
Each file may be up to 25 MB, with at most 10 files per entry. New files append
to existing attachments. Pass `remove_attachment_ids: [1, 2]` in an update to
remove files belonging to that entry. Entry edit permissions apply. Removing
attachments or deleting an entry removes the stored files after commit.
