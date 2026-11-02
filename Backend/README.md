# TSM-API
Time Sheet Management Rest API For Integrating With KMS

## Do List scheduling

The scheduling migration adds fields and an occurrence table. Existing tasks keep
`static` scheduling and `legacy` interval reminders, with their IDs, dates, logs,
statuses and reminder intervals preserved. New API tasks use reminders before the
due date. An empty `reminder_days_before` disables reminders; otherwise use 1–365.

- Static Event: one target date and one completion.
- Continuous Period: start/end dates, displayed across the calendar span, completed once.
- Recurring: the target date anchors daily/weekly/monthly/yearly occurrences.
  Each occurrence is completed or cancelled separately from the task detail dialog.
  Weekly schedules support selected weekdays (Monday=0 through Sunday=6),
  anchored to Monday of the schedule start week for multi-week intervals.
  Monthly schedules support the first day, last day, or a specific day (1–31).
  Missing days clamp to month-end, retaining the selected day for later months.
  Occurrences before the schedule start date are skipped. Existing schedules with
  no explicit day selection retain their original target-date weekday/day.
  Yearly schedules retain their original month/day with leap-day clamping.
- Schedule edits replace future open occurrences and preserve completed, cancelled,
  and overdue occurrences. Pause a recurring schedule with `is_active=false`.
- Occurrences are generated through the next 366 days on create/edit. The existing
  `python manage.py send_self_ticket_reminders` job must run daily to extend that
  window, even if reminders are disabled. Paused schedules resume generation on edit.
- Before-due reminders are sent once per due date/occurrence, within the configured
  lead window and strictly before the due date. Closed/cancelled occurrences and
  paused schedules do not send reminders. Acknowledgement clears the alarm.
- Reports list recurring occurrences separately; task details retain the parent
  schedule and occurrence history.

Deployment: back up the database, then run `python manage.py migrate` from `Backend`
with the application's usual Python environment before deploying the updated UI.
The migration is not applied automatically by the code changes.
