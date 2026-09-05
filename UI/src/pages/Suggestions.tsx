import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";

import api from "../api/axios";
import { showNotification } from "../api/notificationService";
import { formatDateTime } from "../components/common/formatDate";
import {
  VirtualizedTable,
  type ColumnData,
} from "../components/common/TableView";
import {
  buttonLabelCompact,
  buttonLabelFull,
  contentPanel,
  dialogContentTop,
  pageHeaderActions,
  pageHeaderContent,
  pageHeader,
  page,
  pageContent,
  pageSubtitle,
  pageTitle,
} from "../styles/common";

type SuggestionStatus =
  | "Open"
  | "In Review"
  | "Accepted"
  | "Rejected"
  | "Closed";

type SystemSuggestion = Record<string, unknown> & {
  id: number;
  user: number;
  user_name: string | null;
  suggestion: string;
  status: SuggestionStatus;
  remarks: string;
  created_at: string;
  updated_at: string;
};

type SuggestionFormState = {
  suggestion: string;
  status: SuggestionStatus;
  remarks: string;
};

const emptyForm: SuggestionFormState = {
  suggestion: "",
  status: "Open",
  remarks: "",
};

const suggestionStatuses: SuggestionStatus[] = [
  "Open",
  "In Review",
  "Accepted",
  "Rejected",
  "Closed",
];

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState<SystemSuggestion[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] =
    useState<SystemSuggestion | null>(null);
  const [form, setForm] = useState<SuggestionFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadSuggestions = useCallback(async () => {
    const response = await api.get<SystemSuggestion[]>(
      "/documents/system-suggestions/",
    );
    setSuggestions(Array.isArray(response.data) ? response.data : []);
  }, []);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  const openCreateDialog = () => {
    setEditingSuggestion(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (suggestion: SystemSuggestion) => {
    setEditingSuggestion(suggestion);
    setForm({
      suggestion: suggestion.suggestion || "",
      status: suggestion.status || "Open",
      remarks: suggestion.remarks || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setEditingSuggestion(null);
    setForm(emptyForm);
  };

  const updateForm = <K extends keyof SuggestionFormState>(
    key: K,
    value: SuggestionFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitSuggestion = async () => {
    if (!form.suggestion.trim()) {
      showNotification({ type: "warning", message: "Suggestion is required." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        suggestion: form.suggestion.trim(),
        status: form.status,
        remarks: form.remarks.trim(),
      };

      if (editingSuggestion) {
        await api.patch(
          `/documents/system-suggestions/${editingSuggestion.id}/`,
          payload,
        );
      } else {
        await api.post("/documents/system-suggestions/", payload);
      }

      showNotification({
        type: "success",
        message: editingSuggestion
          ? "Suggestion updated successfully."
          : "Suggestion submitted successfully.",
      });
      closeDialog();
      await loadSuggestions();
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnData<SystemSuggestion>[]>(
    () => [
      {
        label: "Suggestion",
        dataKey: "suggestion",
        width: 360,
      },
      {
        label: "Status",
        dataKey: "status",
        width: 130,
      },
      {
        label: "Submitted By",
        dataKey: "user_name",
        width: 160,
      },
      {
        label: "Remarks",
        dataKey: "remarks",
        width: "auto",
      },
      {
        label: "Created Date",
        dataKey: "created_at",
        width: 160,
        render: (row) => formatDateTime(row.created_at),
      },
      {
        label: "Updated Date",
        dataKey: "updated_at",
        width: 160,
        render: (row) => formatDateTime(row.updated_at),
      },
      {
        label: "Actions",
        width: 90,
        render: (row) => (
          <Tooltip title="Edit suggestion">
            <IconButton
              size="small"
              color="primary"
              onClick={() => openEditDialog(row)}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  return (
    <Box sx={page}>
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" sx={pageTitle}>Feedback / Suggestions</Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              Capture ICProDesk feedback and improvement suggestions.
            </Typography>
          </Box>
          <Box sx={pageHeaderActions}>
            <Button
              variant="contained"
              startIcon={<AddCommentOutlinedIcon />}
              onClick={openCreateDialog}
              // sx={{ width: { xs: "160px", sm: "auto" } }}
            >
              <Box component="span" sx={buttonLabelFull}>Add Suggestion</Box>
              <Box component="span" sx={buttonLabelCompact}>Add</Box>
            </Button>
          </Box>
        </Box>

        <Box sx={contentPanel}>
          <VirtualizedTable<SystemSuggestion>
            columns={columns}
            rows={suggestions}
            height="100%"
            tableMinWidth={1220}
            tableHead="Suggestion List"
          />
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <FeedbackOutlinedIcon color="primary" />
            <Typography variant="h6">
              {editingSuggestion ? "Update Suggestion" : "Add Suggestion"}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={dialogContentTop}>
            <TextField
              label="Suggestion"
              value={form.suggestion}
              onChange={(event) => updateForm("suggestion", event.target.value)}
              fullWidth
              required
              multiline
              minRows={4}
            />
            <TextField
              label="Status"
              value={form.status}
              onChange={(event) =>
                updateForm("status", event.target.value as SuggestionStatus)
              }
              fullWidth
              select
              size="small"
            >
              {suggestionStatuses.map((statusValue) => (
                <MenuItem key={statusValue} value={statusValue}>
                  {statusValue}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Remarks"
              value={form.remarks}
              onChange={(event) => updateForm("remarks", event.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={closeDialog}
            disabled={saving}
            startIcon={<CancelOutlinedIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={submitSuggestion}
            disabled={saving}
            variant="contained"
            startIcon={
              saving
                ? undefined
                : editingSuggestion
                  ? <UpdateOutlinedIcon />
                  : <SendOutlinedIcon />
            }
          >
            {saving ? "Saving..." : editingSuggestion ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
