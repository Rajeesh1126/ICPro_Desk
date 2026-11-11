import { Box, Button, Stack, Tooltip } from "@mui/material";
import {
  detailActionBarSx,
  detailActionButtonsSx,
  detailActionGroupSx,
} from "@/styles/detailDialog";
import { ACTION_BUTTONS, type TicketActionId } from "@/components/tickets/detail/ticketActions";

/**
 * The ticket's footer: every action button grouped on the right. What a
 * consequential action does is that button's own tooltip (as footer text it
 * sat beside Edit and read as describing it). Every action still confirms.
 * Dismissing the dialog is the header's close icon only.
 */
export default function TicketActionButtons({
  groups,
  onAction,
}: {
  groups: TicketActionId[][];
  onAction: (action: TicketActionId) => void;
}) {
  const consequential = groups.flat().filter((id) => ACTION_BUTTONS[id].consequential);
  const routine = groups
    .map((group) => group.filter((id) => !ACTION_BUTTONS[id].consequential))
    .filter((group) => group.length);
  return (
    <Box sx={detailActionBarSx}>
      <Box sx={detailActionButtonsSx}>
        {consequential.map((id) => {
          const { label, icon: Icon, color, hint } = ACTION_BUTTONS[id];
          return (
            <Tooltip key={id} title={hint ?? ""}>
              <Button
                onClick={() => onAction(id)}
                variant="outlined"
                color={color}
                startIcon={<Icon />}
              >
                {label}
              </Button>
            </Tooltip>
          );
        })}
        {routine.map((group) => (
          <Stack key={group.join("-")} direction="row" spacing={1} sx={detailActionGroupSx}>
            {group.map((id) => {
              const { label, icon: Icon, variant, color, disabled } = ACTION_BUTTONS[id];
              return (
                <Button
                  key={id}
                  onClick={() => onAction(id)}
                  variant={variant ?? "outlined"}
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
      </Box>
    </Box>
  );
}
