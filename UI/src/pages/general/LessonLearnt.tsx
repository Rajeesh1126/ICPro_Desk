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
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PsychologyAltOutlinedIcon from "@mui/icons-material/PsychologyAltOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import api from "../../api/axios";
import { asArray, useApiQuery } from "../../api/useApiQuery";
import FileUploadField from "../../components/common/FileUploadField";
import { showNotification } from "../../api/notificationService";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DialogHeader from "../../components/common/DialogHeader";
import {
  type ColumnData,
} from "../../components/common/TableView";
import { CollapsibleTableView } from "../../components/common/CollapsibleTableView";
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
import { formatDateTime } from "../../components/common/formatDate";

type LessonStatus = "Draft" | "Shared" | "Reviewed" | "Archived";

type LessonLearntRow = {
  id: number;
  project: string;
  category: string;
  event: string;
  limitations: string;
  actions: string;
  remarks: string;
  status: LessonStatus;
  file: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
};

type LessonFormState = {
  project: string;
  category: string;
  event: string;
  limitations: string;
  actions: string;
  remarks: string;
  status: LessonStatus;
  file: File | null;
};

const emptyForm: LessonFormState = {
  project: "",
  category: "",
  event: "",
  limitations: "",
  actions: "",
  remarks: "",
  status: "Shared",
  file: null,
};

const lessonStatuses: LessonStatus[] = [
  "Draft",
  "Shared",
  "Reviewed",
  "Archived",
];

const getFileName = (filePath: string | null) => {
  if (!filePath) return "No file";
  const cleanPath = filePath.split("?")[0] ?? filePath;
  return cleanPath.split("/").filter(Boolean).pop() ?? "Attachment";
};

const resolveFileUrl = (filePath: string) => {
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const baseUrl = new URL(apiBaseUrl, window.location.origin).origin;
  return new URL(filePath, baseUrl).toString();
};

export default function LessonLearnt() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonLearntRow | null>(
    null,
  );
  const [deleteLesson, setDeleteLesson] = useState<LessonLearntRow | null>(
    null,
  );
  const [form, setForm] = useState<LessonFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Cached list: returning to this page shows the last rows immediately and
  // refreshes in the background. Successful saves/deletes refresh it
  // automatically (see invalidateAfterMutation), so dialogs never reload it.
  const listQuery = useApiQuery<LessonLearntRow[]>("/documents/lesson-learnt/");
  const lessons = useMemo(() => asArray<LessonLearntRow>(listQuery.data), [listQuery.data]);
  const loading = listQuery.isPending;

  const openCreateDialog = () => {
    setEditingLesson(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (lesson: LessonLearntRow) => {
    setEditingLesson(lesson);
    setForm({
      project: lesson.project || "",
      category: lesson.category || "",
      event: lesson.event || "",
      limitations: lesson.limitations || "",
      actions: lesson.actions || "",
      remarks: lesson.remarks || "",
      status: lesson.status || "Shared",
      file: null,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setEditingLesson(null);
    setForm(emptyForm);
  };

  // Ask before discarding typed input (backdrop, Escape, X, Cancel).
  const discard = useDiscardGuard(dialogOpen, closeDialog);

  const updateForm = <K extends keyof LessonFormState>(
    key: K,
    value: LessonFormState[K],
  ) => {
    discard.markDirty();
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitLesson = async () => {
    if (!form.project.trim() || !form.category.trim() || !form.event.trim()) {
      showNotification({
        type: "warning",
        message: "Project, category and event are required.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("project", form.project.trim());
    formData.append("category", form.category.trim());
    formData.append("event", form.event.trim());
    formData.append("limitations", form.limitations.trim());
    formData.append("actions", form.actions.trim());
    formData.append("remarks", form.remarks.trim());
    formData.append("status", form.status);
    if (form.file) {
      formData.append("file", form.file);
    }

    setSaving(true);
    try {
      if (editingLesson) {
        await api.patch(
          `/documents/lesson-learnt/${editingLesson.id}/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        await api.post("/documents/lesson-learnt/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      showNotification({
        type: "success",
        message: editingLesson
          ? "Lesson learnt updated successfully."
          : "Lesson learnt added successfully.",
      });
      closeDialog();
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setSaving(false);
    }
  };

  const downloadFile = (lesson: LessonLearntRow) => {
    if (!lesson.file) return;

    const link = window.document.createElement("a");
    link.href = resolveFileUrl(lesson.file);
    link.download = getFileName(lesson.file);
    link.target = "_blank";
    link.rel = "noreferrer";
    link.click();
  };

  const handleDeleteLesson = async () => {
    if (!deleteLesson) return;

    try {
      await api.delete(`/documents/lesson-learnt/${deleteLesson.id}/`);
      showNotification({
        type: "success",
        message: "Lesson learnt deleted successfully.",
      });
      setDeleteLesson(null);
    } catch {
      // The shared request error dialog explains the failure.
    }
  };

  const columns = useMemo<ColumnData<LessonLearntRow>[]>(
    () => [
      {
        label: "#",
        width: { xs: 40, sm: 40 },
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "Project",
        dataKey: "project",
        width: 180,
      },
      {
        label: "Category",
        dataKey: "category",
        width: 150,
      },
      {
        label: "Event",
        dataKey: "event",
        width: 300,
      },
      {
        label: "Actions Taken",
        dataKey: "actions",
        width: 260,
      },
      {
        label: "Status",
        dataKey: "status",
        width: 120,
      },
      {
        label: "Shared By",
        dataKey: "created_by_name",
        width: 150,
      },
      {
        label: "Created Date",
        dataKey: "created_at",
        width: 160,
        render: (row) => formatDateTime(row.created_at),
      },
      {
        label: "Attachment",
        width: 160,
        render: (row) => getFileName(row.file),
      },
      {
        label: "Actions",
        width: 120,
        render: (row) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit lesson">
              <IconButton
                aria-label="Edit lesson"
                size="small"
                color="primary"
                onClick={() => openEditDialog(row)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download attachment">
              <span><IconButton
                aria-label="Download lesson attachment"
                size="small"
                disabled={!row.file}
                onClick={() => downloadFile(row)}
              >
                <DownloadOutlinedIcon fontSize="small" />
              </IconButton></span>
            </Tooltip>
            <Tooltip title="Delete lesson">
              <IconButton
                aria-label="Delete lesson"
                size="small"
                onClick={() => setDeleteLesson(row)}
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
  const primaryColumns = useMemo(
    () =>
      columns.filter((column) =>
        ["#", "Project", "Event", "Status", "Shared By", "Actions"].includes(
          column.label,
        ),
      ),
    [columns],
  );
  const detailColumns = useMemo(
    () =>
      columns.filter((column) =>
        ["Category", "Actions Taken", "Created Date", "Attachment"].includes(
          column.label,
        ),
      ),
    [columns],
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" component="h1" sx={pageTitle}>Lessons Learned</Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              Capture project execution learning and shared experience.
            </Typography>
          </Box>
          <Box sx={pageHeaderActions}>
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={openCreateDialog}
            >
              <Box component="span" sx={buttonLabelFull}>Add Lesson</Box>
              <Box component="span" sx={buttonLabelCompact}>Add</Box>
            </Button>
          </Box>
        </Box>

        <Box sx={contentPanel}>
          <CollapsibleTableView<LessonLearntRow>
            columns={primaryColumns}
            expandedColumns={detailColumns}
            mobileColumns={columns}
            rows={lessons}
            getRowId={(row) => row.id}
            height="100%"
            tableMinWidth={900}
            tableHead="Lessons Learned"
            loading={loading}
            emptyTitle="No lessons recorded yet"
            emptyDescription="Add a lesson to share what the team learned on a project."
          />
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={discard.requestClose} onChangeCapture={discard.markDirty} fullWidth maxWidth="md">
        <DialogHeader
          title={editingLesson ? "Update Lesson" : "Add Lesson"}
          icon={<PsychologyAltOutlinedIcon />}
          onClose={discard.requestClose}
        />
        <DialogContent>
          <Stack spacing={2} sx={dialogContentTop}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Project"
                value={form.project}
                onChange={(event) => updateForm("project", event.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Category"
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Status"
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value as LessonStatus)
                }
                fullWidth
                select
              >
                {lessonStatuses.map((statusValue) => (
                  <MenuItem key={statusValue} value={statusValue}>
                    {statusValue}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              label="Event / Learning"
              value={form.event}
              onChange={(event) => updateForm("event", event.target.value)}
              fullWidth
              required
              multiline
              minRows={3}
            />
            <TextField
              label="Limitations"
              value={form.limitations}
              onChange={(event) =>
                updateForm("limitations", event.target.value)
              }
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Actions Taken"
              value={form.actions}
              onChange={(event) => updateForm("actions", event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Remarks"
              value={form.remarks}
              onChange={(event) => updateForm("remarks", event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <FileUploadField
              file={form.file}
              onChange={(file) => updateForm("file", file)}
              existingFileName={editingLesson?.file ? getFileName(editingLesson.file) : null}
              buttonLabel="Attach File"
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
            onClick={submitLesson}
            disabled={saving}
            variant="contained"
            startIcon={
              saving ? undefined : editingLesson ? (
                <UpdateOutlinedIcon />
              ) : (
                <SaveOutlinedIcon />
              )
            }
          >
            {saving ? "Saving..." : editingLesson ? "Update" : "Save"}
          </Button>
        </DialogActions>
        {discard.dialog}
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleteLesson)}
        onClose={() => setDeleteLesson(null)}
        title="Delete Lesson"
        description={`Delete "${deleteLesson?.event || "this lesson learnt"}"?`}
        titleIcon={<DeleteOutlinedIcon fontSize="small" />}
        confirmLabel="Delete"
        confirmColor="error"
        confirmIcon={<DeleteOutlinedIcon />}
        tone="error"
        onConfirm={handleDeleteLesson}
      />
    </Box>
  );
}
