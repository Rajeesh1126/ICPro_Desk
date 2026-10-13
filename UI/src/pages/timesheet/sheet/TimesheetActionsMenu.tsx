import { useState, type ReactNode } from "react";
import { Badge, Box, Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import {
  actionMenuItem,
  actionMenuPaper,
  actionMenuSection,
  compactDivider,
  compactHeaderButton,
  headerActionBadge,
} from "../../../styles/common";

export type AddWorkKind = "quotation" | "undefined" | "costMaster" | "tickets";
export type WeekTaskKind = "unlock" | "extend" | "remove";

interface TimesheetActionsMenuProps {
  selectedCount: number;
  actionsDisabled: boolean;
  unlockDisabled: boolean;
  previewDisabled: boolean;
  onAddWork: (kind: AddWorkKind) => void;
  onWeekTask: (kind: WeekTaskKind) => void;
  onPreview: () => void;
}

type Tone = Parameters<typeof actionMenuItem>[0];

/** The "Actions" button and menu: add work, week controls and submit. */
export default function TimesheetActionsMenu({
  selectedCount,
  actionsDisabled,
  unlockDisabled,
  previewDisabled,
  onAddWork,
  onWeekTask,
  onPreview,
}: TimesheetActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const close = () => setAnchorEl(null);
  // Close the menu first, then act (opening a dialog over an open menu traps focus).
  const run = (action: () => void) => () => {
    close();
    action();
  };

  const item = (
    tone: Tone,
    icon: ReactNode,
    primary: string,
    secondary: string,
    onClick: () => void,
    disabled = false,
  ) => (
    <MenuItem onClick={run(onClick)} disabled={disabled} sx={actionMenuItem(tone)}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={primary} secondary={secondary} />
    </MenuItem>
  );

  const button = (
    <Button
      variant="contained"
      onClick={(event) => setAnchorEl(event.currentTarget)}
      endIcon={<KeyboardArrowDownOutlinedIcon />}
      sx={compactHeaderButton}
      aria-haspopup="menu"
      aria-expanded={Boolean(anchorEl)}
    >
      Actions
    </Button>
  );

  return (
    <>
      {selectedCount > 0 ? (
        <Badge badgeContent={selectedCount} color="error" sx={headerActionBadge}>
          {button}
        </Badge>
      ) : (
        button
      )}

      <Menu
        id="timesheet-actions-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={close}
        slotProps={{ paper: { sx: actionMenuPaper } }}
      >
        <Box sx={actionMenuSection}>Add work</Box>
        {item("primary", <WorkOutlineOutlinedIcon fontSize="small" />, "Assign Jobs From ERP",
          "Import approved job records into this week.", () => onAddWork("quotation"), actionsDisabled)}
        {item("info", <HelpOutlineOutlinedIcon fontSize="small" />, "Create Undefined Jobs",
          "Add a temporary job if ERP details are missing.", () => onAddWork("undefined"), actionsDisabled)}
        {item("success", <AssignmentOutlinedIcon fontSize="small" />, "Import Undefined Tasks To Job",
          "Map temporary tasks to cost codes.", () => onAddWork("costMaster"), actionsDisabled)}
        {item("secondary", <ConfirmationNumberOutlinedIcon fontSize="small" />, "Assigned Tickets",
          "Bring ticket work into the current timesheet.", () => onAddWork("tickets"), actionsDisabled)}

        <Divider sx={compactDivider} />
        <Box sx={actionMenuSection}>Week controls</Box>
        {item("warning", <LockOpenOutlinedIcon fontSize="small" />, "Unlock Time Sheet Request",
          "Ask for edit access after submission is locked.", () => onWeekTask("unlock"), unlockDisabled)}
        {item("info", <UpdateOutlinedIcon fontSize="small" />, "Extend Task To Next Week",
          selectedCount
            ? `${selectedCount} selected task(s) will move forward.`
            : "Select tasks in the table before extending.",
          () => onWeekTask("extend"))}
        {item("error", <DeleteOutlineOutlinedIcon fontSize="small" />, "Remove Task / Project",
          selectedCount
            ? `${selectedCount} selected task(s) may be removed.`
            : "Select removable tasks first.",
          () => onWeekTask("remove"), actionsDisabled)}

        <Divider sx={compactDivider} />
        <Box sx={actionMenuSection}>Finalize</Box>
        {item("success", <SendOutlinedIcon fontSize="small" />, "Preview / Submit",
          "Check totals and send this week for approval.", onPreview, previewDisabled)}
      </Menu>
    </>
  );
}
