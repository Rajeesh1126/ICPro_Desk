import { Checkbox, FormControl, FormGroup, FormLabel, FormControlLabel, Grid, MenuItem, TextField, Typography } from "@mui/material";
import type { SelfTicketFormData } from "@/types/dataTypes";

type Props = {
  value: SelfTicketFormData;
  update: <K extends keyof SelfTicketFormData>(key: K, value: SelfTicketFormData[K]) => void;
  hasOccurrences: boolean;
};
export default function ScheduleFields({ value, update, hasOccurrences }: Props) {
  const anchorDay = new Date(`${value.target_date}T00:00:00`).getDay();
  const weekdays = value.repeat_weekdays ?? [Number.isNaN(anchorDay) ? 0 : (anchorDay + 6) % 7];
  const monthlyDay = value.repeat_day_of_month ?? (Number(value.target_date.split("-")[2]) || 1);
  return <>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField select fullWidth label="Schedule type" value={value.schedule_type ?? "static"}
        disabled={hasOccurrences}
        onChange={(e) => {
          update("schedule_type", e.target.value as SelfTicketFormData["schedule_type"]);
        }}>
        <MenuItem value="static">Static Event</MenuItem>
        <MenuItem value="period">Continuous Period</MenuItem>
        <MenuItem value="recurring">Recurring</MenuItem>
      </TextField>
    </Grid>
    {value.schedule_type === "period" && <Grid size={{ xs: 12, sm: 6 }}>
      <TextField required fullWidth type="date" label="Start date" value={value.start_date ?? ""}
        slotProps={{ inputLabel: { shrink: true } }}
        onChange={(e) => update("start_date", e.target.value || null)} />
    </Grid>}
    {value.schedule_type === "recurring" && <>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField select fullWidth label="Repeat" value={value.repeat_frequency ?? "monthly"}
          onChange={(e) => update("repeat_frequency", e.target.value as SelfTicketFormData["repeat_frequency"])}>
          {["daily", "weekly", "monthly", "yearly"].map((frequency) => <MenuItem key={frequency} value={frequency}>{frequency}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField fullWidth type="number" label="Repeat every" value={value.repeat_interval ?? 1}
          slotProps={{ htmlInput: { min: 1, max: 100, step: 1 } }}
          onChange={(e) => update("repeat_interval", Number(e.target.value))} />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField fullWidth type="date" label="Repeat until (optional)" value={value.repeat_until ?? ""}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: value.target_date } }}
          onChange={(e) => update("repeat_until", e.target.value || null)} />
      </Grid>
      {value.repeat_frequency === "weekly" && <Grid size={{ xs: 12 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Repeat on</FormLabel>
          <FormGroup row>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => (
              <FormControlLabel key={day} label={day} control={<Checkbox
                checked={weekdays.includes(index)}
                disabled={weekdays.length === 1 && weekdays.includes(index)}
                onChange={(event) => update("repeat_weekdays", event.target.checked
                  ? [...weekdays, index].sort((a, b) => a - b)
                  : weekdays.filter((item) => item !== index))}
              />} />
            ))}
          </FormGroup>
        </FormControl>
        <Typography variant="caption" display="block">Choose one or more weekdays. Weeks start on Monday; the interval counts from the week containing the schedule start date.</Typography>
      </Grid>}
      {value.repeat_frequency === "monthly" && <>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select fullWidth label="Day of month" value={value.monthly_day_mode ?? "specific"}
            onChange={(event) => update("monthly_day_mode", event.target.value as SelfTicketFormData["monthly_day_mode"])}>
            <MenuItem value="first">First day of month</MenuItem>
            <MenuItem value="last">Last day of month</MenuItem>
            <MenuItem value="specific">Specific day</MenuItem>
          </TextField>
        </Grid>
        {(value.monthly_day_mode ?? "specific") === "specific" && <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select fullWidth label="Day" value={monthlyDay}
            helperText="Uses the last day if the selected day is missing in a shorter month."
            onChange={(event) => update("repeat_day_of_month", Number(event.target.value))}>
            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => <MenuItem key={day} value={day}>{day}</MenuItem>)}
          </TextField>
        </Grid>}
      </>}
      <Grid size={{ xs: 12 }}>
        <FormControlLabel label="Schedule active" control={<Checkbox checked={value.is_active !== false}
          onChange={(e) => update("is_active", e.target.checked)} />} />
        <Typography variant="caption" display="block">Complete each occurrence separately. Monthly dates use the last day in shorter months. Changing the schedule replaces future open occurrences; completed and overdue occurrences remain.</Typography>
      </Grid>
    </>}
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField select fullWidth label="Reminder" value={value.reminder_mode ?? "before_due"}
        onChange={(e) => update("reminder_mode", e.target.value as SelfTicketFormData["reminder_mode"])}>
        <MenuItem value="before_due">Before due date</MenuItem>
        <MenuItem value="legacy">Interval reminder</MenuItem>
      </TextField>
    </Grid>
    {value.reminder_mode !== "legacy" && <Grid size={{ xs: 12, sm: 6 }}>
      <TextField fullWidth type="number" label="Days before due date" value={value.reminder_days_before ?? ""}
        helperText="Leave empty to disable. One reminder per task or occurrence."
        slotProps={{ htmlInput: { min: 1, max: 365, step: 1 } }}
        onChange={(e) => update("reminder_days_before", e.target.value ? Number(e.target.value) : null)} />
    </Grid>}
  </>;
}
