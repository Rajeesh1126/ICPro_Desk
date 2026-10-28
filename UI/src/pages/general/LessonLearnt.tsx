import { useDiscardGuard } from "@/components/common/useDiscardGuard";
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
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

import api from "@/api/axios";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import FileUploadField from "@/components/common/FileUploadField";
import { showNotification } from "@/api/notificationService";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DialogHeader from "@/components/common/DialogHeader";
import { TableActionGroup } from "@/components/common/ActionDivider";
import { type ColumnData } from "@/components/common/TableView";
import { CollapsibleTableView } from "@/components/common/CollapsibleTableView";
import {
  buttonLabelCompact,
  buttonLabelFull,
  contentPanel,
  page,
  pageContent,
  deleteIconSx,
  rowDeleteButtonSx,
  preWrapTextSx,
} from "@/styles/common";
import { formatDateTime } from "@/components/common/formatDate";
import { getStoredPermissions } from "@/utils/permissions";
import PageHeader from "@/components/common/PageHeader";

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

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const baseUrl = new URL(apiBaseUrl, window.location.origin).origin;
  return new URL(filePath, baseUrl).toString();
};

export default function LessonLearnt() {
  const permissions = getStoredPermissions();
  const canAddLesson = permissions.has("add_lessonlearnt");
  const canChangeLesson = permissions.has("change_lessonlearnt");
  const canDeleteLesson = permissions.has("delete_lessonlearnt");
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
  const lessons = useMemo(
    () => asArray<LessonLearntRow>(listQuery.data),
    [listQuery.data],
  );
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
        label: "Project",
        dataKey: "project",
        width: 280,
      },
      {
        label: "Category",
        dataKey: "category",
        width: 150,
      },
      {
        label: "Event",
        dataKey: "event",
        width: "auto",
        wrap: true,
      },
      {
        label: "Actions Taken",
        dataKey: "actions",
        width: 260,
        wrap: true,
      },
      { label: "Limitations", dataKey: "limitations", width: 260, wrap: true },
      { label: "Remarks", dataKey: "remarks", width: 260, wrap: true },
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
        render: (row) => row.file ? <Button startIcon={<DownloadOutlinedIcon />} onClick={() => downloadFile(row)}>{getFileName(row.file)}</Button> : "No attachment",
      },
      {
        label: "Actions",
        width: 140,
        render: (row) => (
          <TableActionGroup>
            {canChangeLesson && (
              <Tooltip title="Edit lesson">
                <IconButton
                  aria-label="Edit lesson"
                  color="primary"
                  onClick={() => openEditDialog(row)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Download attachment">
              <span>
                <IconButton
                  aria-label="Download lesson attachment"
                  disabled={!row.file}
                  onClick={() => downloadFile(row)}
                >
                  <DownloadOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            {canDeleteLesson && (
              <Tooltip title="Delete lesson">
                <IconButton
                  sx={rowDeleteButtonSx}
                  aria-label="Delete lesson"
                  onClick={() => setDeleteLesson(row)}
                >
                  <DeleteOutlinedIcon fontSize="small" sx={deleteIconSx} />
                </IconButton>
              </Tooltip>
            )}
          </TableActionGroup>
        ),
      },
    ],
    [canChangeLesson, canDeleteLesson],
  );
  const primaryColumns = useMemo(
    () =>
      columns.filter((column) =>
        ["Project", "Event", "Status", "Shared By", "Created Date", "Actions"].includes(
          column.label,
        ),
      ),
    [columns],
  );
  const detailColumns = useMemo(
    () =>
      columns.filter((column) =>
        ["Category", "Actions Taken", "Attachment", "Limitations", "Remarks"].includes(
          column.label,
        ),
      ).concat([
        { label: "Full Event / Learning", dataKey: "event", width: "auto", render: (row: LessonLearntRow) => <Typography variant="body2" sx={preWrapTextSx}>{row.event || "—"}</Typography> },
      ]),
    [columns],
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <PageHeader
          title="Lessons Learnt"
          subtitle="Capture project execution learning and shared experience."
          actions={[
            canAddLesson && {
              key: "add",
              priority: "high",
              node: (
                <Button
                  variant="contained"
                  startIcon={<AddOutlinedIcon />}
                  onClick={openCreateDialog}
                >
                  <Box component="span" sx={buttonLabelFull}>
                    Add Lesson
                  </Box>
                  <Box component="span" sx={buttonLabelCompact}>
                    Add
                  </Box>
                </Button>
              ),
            },
          ]}
        />

        <Box sx={contentPanel}>
          <CollapsibleTableView<LessonLearntRow>
            columns={primaryColumns}
            expandedColumns={detailColumns}
            mobileColumns={columns}
            rows={lessons}
            getRowId={(row) => row.id}
            height={lessons.length <= 3 ? "auto" : "100%"}
            tableMinWidth={900}
            tableHead="Lessons"
            loading={loading}
            emptyTitle="No lessons recorded yet"
            emptyDescription="Add a lesson to share what the team learned on a project."
          />
        </Box>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={discard.requestClose}
        onChangeCapture={discard.markDirty}
        fullWidth
        maxWidth="md"
      >
        <DialogHeader
          title={editingLesson ? "Update Lesson" : "Add Lesson"}
          onClose={discard.requestClose}
        />
        <DialogContent>
          <Stack spacing={2}>
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
              existingFileName={
                editingLesson?.file ? getFileName(editingLesson.file) : null
              }
              buttonLabel="Attach File"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={submitLesson}
            disabled={saving}
            variant="contained"
            startIcon={
              saving ? undefined : editingLesson ? (
                <SaveOutlinedIcon />
              ) : (
                <CheckOutlinedIcon />
              )
            }
          >
            {saving ? "Saving..." : editingLesson ? "Update" : "Submit"}
          </Button>
        </DialogActions>
        {discard.dialog}
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleteLesson)}
        onClose={() => setDeleteLesson(null)}
        title="Delete Lesson"
        description={`Delete "${deleteLesson?.event || "this lesson learnt"}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        confirmIcon={<DeleteOutlinedIcon />}
        onConfirm={handleDeleteLesson}
      />
    </Box>
  );
}
