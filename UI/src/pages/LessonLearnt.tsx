import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PsychologyAltOutlinedIcon from "@mui/icons-material/PsychologyAltOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import api from "../api/axios";
import { showNotification } from "../api/notificationService";
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
import { formatDateTime } from "../components/common/formatDate";

type LessonStatus = "Draft" | "Shared" | "Reviewed" | "Archived";

type LessonLearntRow = Record<string, unknown> & {
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

  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  return new URL(filePath, baseUrl).toString();
};

export default function LessonLearnt() {
  const [lessons, setLessons] = useState<LessonLearntRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonLearntRow | null>(
    null,
  );
  const [form, setForm] = useState<LessonFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadLessons = useCallback(async () => {
    const response = await api.get<LessonLearntRow[]>(
      "/documents/lesson-learnt/",
    );
    setLessons(Array.isArray(response.data) ? response.data : []);
  }, []);

  useEffect(() => {
    void loadLessons();
  }, [loadLessons]);

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

  const updateForm = <K extends keyof LessonFormState>(
    key: K,
    value: LessonFormState[K],
  ) => {
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
      await loadLessons();
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

  const columns = useMemo<ColumnData<LessonLearntRow>[]>(
    () => [
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
        width: 110,
        render: (row) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit lesson">
              <IconButton
                size="small"
                color="primary"
                onClick={() => openEditDialog(row)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download attachment">
              <IconButton
                size="small"
                disabled={!row.file}
                onClick={() => downloadFile(row)}
              >
                <DownloadOutlinedIcon fontSize="small" />
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
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" sx={pageTitle}>Lesson Learnt</Typography>
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
          <VirtualizedTable<LessonLearntRow>
            columns={columns}
            rows={lessons}
            height="100%"
            tableHead="Lesson Learnt List"
          />
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <PsychologyAltOutlinedIcon color="primary" />
            <Typography variant="h6">
              {editingLesson ? "Update Lesson Learnt" : "Add Lesson Learnt"}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={dialogContentTop}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Project"
                value={form.project}
                onChange={(event) => updateForm("project", event.target.value)}
                fullWidth
                required
                size="small"
              />
              <TextField
                label="Category"
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
                fullWidth
                required
                size="small"
              />
              <TextField
                label="Status"
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value as LessonStatus)
                }
                fullWidth
                select
                size="small"
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
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
            >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(event) =>
                  updateForm("file", event.target.files?.[0] ?? null)
                }
              />
              <Button
                variant="outlined"
                startIcon={<UploadFileOutlinedIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
              <Typography variant="body2" color="text.secondary">
                {form.file?.name ||
                  (editingLesson
                    ? getFileName(editingLesson.file)
                    : "No file selected")}
              </Typography>
            </Stack>
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
      </Dialog>
    </Box>
  );
}
