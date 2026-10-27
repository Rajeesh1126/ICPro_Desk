import { Box, Button, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  detailActionBarSx,
  detailActionButtonsSx,
  detailActionGroupSx,
  detailNoteSx,
} from "@/styles/detailDialog";
import { ACTION_BUTTONS, type TicketActionId } from "@/components/tickets/detail/ticketActions";

/**
 * The ticket's footer: information text on the left (what a consequential
 * action does), every action button grouped on the right. Every action still
 * confirms. Dismissing the dialog is the header's close icon only.
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
  const hints = consequential
    .map((id) => ACTION_BUTTONS[id].hint)
    .filter((hint): hint is string => Boolean(hint));

  return (
    <Box sx={detailActionBarSx}>
      {hints.length > 0 && (
        <Box sx={detailNoteSx}>
          <InfoOutlinedIcon aria-hidden="true" />
          <Typography variant="caption">{hints.join(" ")}</Typography>
        </Box>
      )}
      <Box sx={detailActionButtonsSx}>
        {consequential.map((id) => {
          const { label, icon: Icon, color } = ACTION_BUTTONS[id];
          return (
            <Button
              key={id}
              onClick={() => onAction(id)}
              variant="outlined"
              color={color}
              startIcon={<Icon />}
            >
              {label}
            </Button>
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
