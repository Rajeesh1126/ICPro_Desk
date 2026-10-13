import { useDiscardGuard } from "../../components/common/useDiscardGuard";
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
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
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import api from "../../api/axios";
import { asArray, useApiQuery } from "../../api/useApiQuery";
import { showNotification } from "../../api/notificationService";
import { formatDateTime } from "../../components/common/formatDate";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DialogHeader from "../../components/common/DialogHeader";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
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
  deleteIconSx,
} from "../../styles/common";

type SuggestionStatus =
  | "Open"
  | "In Review"
  | "Accepted"
  | "Rejected"
  | "Closed";

type SystemSuggestion = {
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] =
    useState<SystemSuggestion | null>(null);
  const [deleteSuggestion, setDeleteSuggestion] =
    useState<SystemSuggestion | null>(null);
  const [form, setForm] = useState<SuggestionFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Cached list: returning to this page shows the last rows immediately and
  // refreshes in the background. Successful saves/deletes refresh it
  // automatically (see invalidateAfterMutation), so dialogs never reload it.
  const listQuery = useApiQuery<SystemSuggestion[]>("/documents/system-suggestions/");
  const suggestions = useMemo(() => asArray<SystemSuggestion>(listQuery.data), [listQuery.data]);
  const loading = listQuery.isPending;

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

  // Ask before discarding typed input (backdrop, Escape, X, Cancel).
  const discard = useDiscardGuard(dialogOpen, closeDialog);

  const updateForm = <K extends keyof SuggestionFormState>(
    key: K,
    value: SuggestionFormState[K],
  ) => {
    discard.markDirty();
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
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSuggestion = async () => {
    if (!deleteSuggestion) return;

    try {
      await api.delete(`/documents/system-suggestions/${deleteSuggestion.id}/`);
      showNotification({
        type: "success",
        message: "Suggestion deleted successfully.",
      });
      setDeleteSuggestion(null);
    } catch {
      // The shared request error dialog explains the failure.
    }
  };

  const columns = useMemo<ColumnData<SystemSuggestion>[]>(
    () => [
      {
        label: "#",
        width: { xs: 40, sm: 40 },
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "Suggestion",
        dataKey: "suggestion",
        width: "auto",
      },
      {
        label: "Status",
        dataKey: "status",
      },
      {
        label: "Submitted By",
        dataKey: "user_name",
      },
      {
        label: "Remarks",
        dataKey: "remarks",
        width: "auto",
        render: (row) => row.remarks?.trim() || "No remarks",
      },
      {
        label: "Created Date",
        dataKey: "created_at",
        width: 150,
        render: (row) => formatDateTime(row.created_at),
      },
      {
        label: "Updated Date",
        dataKey: "updated_at",
        width: 150,
        render: (row) => formatDateTime(row.updated_at),
      },
      {
        label: "Actions",
        width: 85,
        render: (row) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit suggestion">
              <IconButton
                aria-label="Edit suggestion"
                size="small"
                color="primary"
                onClick={() => openEditDialog(row)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete suggestion">
              <IconButton
                aria-label="Delete suggestion"
                size="small"
                onClick={() => setDeleteSuggestion(row)}
              >
                <DeleteOutlinedIcon fontSize="small" sx={deleteIconSx} />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" component="h1" sx={pageTitle}>Suggestion / Feedback</Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              Capture ICProDesk feedback and improvement suggestions.
            </Typography>
          </Box>
          <Box sx={pageHeaderActions}>
            <Button
              variant="contained"
              startIcon={<AddCommentOutlinedIcon />}
              onClick={openCreateDialog}
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
            loading={loading}
            emptyTitle="No suggestions yet"
            emptyDescription="Share an idea or feedback to help improve ICProDesk."
          />
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={discard.requestClose} onChangeCapture={discard.markDirty} fullWidth maxWidth="sm">
        <DialogHeader
          title={editingSuggestion ? "Update Suggestion" : "Add Suggestion"}
          icon={<FeedbackOutlinedIcon />}
          onClose={discard.requestClose}
        />
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
              helperText={`${form.suggestion.length} characters`}
            />
            <TextField
              label="Status"
              value={form.status}
              onChange={(event) =>
                updateForm("status", event.target.value as SuggestionStatus)
              }
              fullWidth
              select
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
              helperText={`${form.remarks.length} characters`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={discard.requestClose}
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
        {discard.dialog}
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleteSuggestion)}
        onClose={() => setDeleteSuggestion(null)}
        title="Delete Suggestion"
        description="Delete this suggestion?"
        titleIcon={<DeleteOutlinedIcon fontSize="small" />}
        confirmLabel="Delete"
        confirmColor="error"
        confirmIcon={<DeleteOutlinedIcon />}
        tone="error"
        onConfirm={handleDeleteSuggestion}
      />
    </Box>
  );
}
