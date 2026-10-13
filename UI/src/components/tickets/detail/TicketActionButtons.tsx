import { Button, Stack } from "@mui/material";
import { ticketDetailActionsSx } from "../../../styles/common";
import { ACTION_BUTTONS, type TicketActionId } from "./ticketActions";

/** The ticket's available actions, in their workflow groups. */
export default function TicketActionButtons({
  groups,
  onAction,
}: {
  groups: TicketActionId[][];
  onAction: (action: TicketActionId) => void;
}) {
  return (
    <Stack direction="row" spacing={1.5} sx={ticketDetailActionsSx}>
      {groups.map((group) => (
        <Stack key={group.join("-")} direction="row" spacing={1.5}>
          {group.map((id) => {
            const { label, icon: Icon, variant, color, disabled } = ACTION_BUTTONS[id];
            return (
              <Button
                key={id}
                onClick={() => onAction(id)}
                variant={variant}
                color={color}
                startIcon={<Icon />}
                disabled={disabled}
              >
                {label}
              </Button>
            );
          })}
        </Stack>
      ))}
    </Stack>
  );
}
