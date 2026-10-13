import { useEffect, useRef, useState } from "react";
import { TextField, Tooltip, type SxProps, type Theme } from "@mui/material";
import {
  describeHoursMinutes,
  formatEntryValue,
  hoursInputError,
  hoursMinutesToSeconds,
  normaliseHoursInput,
} from "../../utils/hoursMinutes";

interface HoursInputProps {
  value: number | string | undefined;
  disabled?: boolean;
  /** Called with a valid (or still-being-typed) h.mm string. */
  onChange: (value: string) => void;
  ariaLabel: string;
  sx?: SxProps<Theme>;
  size?: "small" | "medium";
}

/**
 * Hour entry in h.mm notation ("1.30" = 1 h 30 m). While focused it shows
 * exactly what was typed; once left it shows the normalised value ("7.5" →
 * "7.50") so the interpretation is visible, with the reading in words on
 * hover. Invalid keystrokes are explained instead of silently ignored.
 */
export default function HoursInput({
  value,
  disabled,
  onChange,
  ariaLabel,
  sx,
  size = "small",
}: HoursInputProps) {
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Always controlled: hover/focus opens it, and an error forces it open.
  const [hintOpen, setHintOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const raw = String(value ?? "");
  const shown = focused ? (raw === "0" ? "" : raw) : formatEntryValue(raw);
  const seconds = hoursMinutesToSeconds(raw);

  const handleChange = (next: string) => {
    const normalised = normaliseHoursInput(next);
    const problem = hoursInputError(normalised);
    if (problem) {
      setError(problem);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setError(null), 2500);
      return;
    }
    setError(null);
    onChange(normalised);
  };

  return (
    <Tooltip
      title={error ?? (seconds ? `= ${describeHoursMinutes(seconds)}` : "")}
      open={Boolean(error) || (hintOpen && Boolean(seconds))}
      onOpen={() => setHintOpen(true)}
      onClose={() => setHintOpen(false)}
      placement="top"
      arrow
    >
      <TextField
        value={shown}
        disabled={disabled}
        error={Boolean(error)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setError(null);
        }}
        onChange={(event) => handleChange(event.target.value)}
        type="text"
        size={size}
        slotProps={{
          htmlInput: {
            inputMode: "decimal",
            placeholder: "0.00",
            "aria-label": ariaLabel,
            "aria-invalid": Boolean(error),
            "aria-description": seconds ? describeHoursMinutes(seconds) : undefined,
          },
        }}
        sx={sx}
      />
    </Tooltip>
  );
}
