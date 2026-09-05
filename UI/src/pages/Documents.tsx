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
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
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
  responsiveRightActions,
} from "../styles/common";

type DocumentType = "FDS" | "SDS" | "Template" | "Other";

type DocumentTemplate = Record<string, unknown> & {
  id: number;
  document_name: string;
  document_type: DocumentType;
  version: string;
  description: string;
  file: string;
  uploaded_by_name: string | null;
  updated_at: string;
  is_active: boolean;
};

type DocumentFormState = {
  document_name: string;
  document_type: DocumentType;
  version: string;
  description: string;
  file: File | null;
};

const emptyForm: DocumentFormState = {
  document_name: "",
  document_type: "Template",
  version: "",
  description: "",
  file: null,
};

const documentTypes: DocumentType[] = ["FDS", "SDS", "Template", "Other"];

const getFileName = (filePath: string) => {
  const cleanPath = filePath.split("?")[0] ?? filePath;
  return cleanPath.split("/").filter(Boolean).pop() ?? "Document";
};

const resolveFileUrl = (filePath: string) => {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  return new URL(filePath, baseUrl).toString();
};

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentTemplate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DocumentFormState>(emptyForm);
  const [editingDocument, setEditingDocument] =
    useState<DocumentTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadDocuments = useCallback(async () => {
    const response = await api.get<DocumentTemplate[]>(
      "/documents/document-templates/",
    );
    setDocuments(Array.isArray(response.data) ? response.data : []);
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const openCreateDialog = () => {
    setEditingDocument(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openReplaceDialog = (document: DocumentTemplate) => {
    setEditingDocument(document);
    setForm({
      document_name: document.document_name,
      document_type: document.document_type,
      version: document.version || "",
      description: document.description || "",
      file: null,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setEditingDocument(null);
    setForm(emptyForm);
  };

  const updateForm = <K extends keyof DocumentFormState>(
    key: K,
    value: DocumentFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitDocument = async () => {
    if (!form.document_name.trim()) {
      showNotification({
        type: "warning",
        message: "Document name is required.",
      });
      return;
    }

    if (!editingDocument && !form.file) {
      showNotification({
        type: "warning",
        message: "Please choose a document file.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("document_name", form.document_name.trim());
    formData.append("document_type", form.document_type);
    formData.append("version", form.version.trim());
    formData.append("description", form.description.trim());
    if (form.file) {
      formData.append("file", form.file);
    }

    setSaving(true);
    try {
      if (editingDocument) {
        await api.patch(
          `/documents/document-templates/${editingDocument.id}/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        await api.post("/documents/document-templates/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      showNotification({
        type: "success",
        message: editingDocument
          ? "Document updated successfully."
          : "Document uploaded successfully.",
      });
      closeDialog();
      await loadDocuments();
    } finally {
      setSaving(false);
    }
  };

  const downloadDocument = (document: DocumentTemplate) => {
    const link = window.document.createElement("a");
    link.href = resolveFileUrl(document.file);
    link.download = getFileName(document.file);
    link.target = "_blank";
    link.rel = "noreferrer";
    link.click();
  };

  const columns = useMemo<ColumnData<DocumentTemplate>[]>(
    () => [
      {
        label: "#",
        width: { xs: 40, sm: 40 },
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "Document Name",
        dataKey: "document_name",
        width: 240,
      },
      {
        label: "Type",
        dataKey: "document_type",
        width: 110,
      },
      {
        label: "Version",
        dataKey: "version",
        width: 100,
      },
      {
        label: "File",
        width: 220,
        render: (row) => getFileName(row.file),
      },
      {
        label: "Uploaded By",
        dataKey: "uploaded_by_name",
        width: 150,
      },
      {
        label: "Updated Date",
        dataKey: "updated_at",
        width: 160,
        render: (row) => formatDateTime(row.updated_at),
      },
      {
        label: "Actions",
        width: 115,
        render: (row) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Upload new version">
              <IconButton
                size="small"
                color="info"
                onClick={() => openReplaceDialog(row)}
              >
                <UploadFileOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download document">
              <IconButton
                size="small"
                color="primary"
                disabled={!row.file}
                onClick={() => downloadDocument(row)}
              >
                <DownloadOutlinedIcon />
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
            <Typography variant="h5" sx={pageTitle}>
              Documents
            </Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              Manage FDS, SDS and reusable document templates.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "row-reverse", sm: "row" }}
            spacing={1}
            sx={[pageHeaderActions, responsiveRightActions]}
          >
            <Button
              variant="contained"
              startIcon={<UploadOutlinedIcon />}
              onClick={openCreateDialog}
            >
              <Box component="span" sx={buttonLabelFull}>
                Upload Document
              </Box>
              <Box component="span" sx={buttonLabelCompact}>
                Upload
              </Box>
            </Button>
          </Stack>
        </Box>

        <Box sx={contentPanel}>
          <VirtualizedTable<DocumentTemplate>
            columns={columns}
            rows={documents}
            height="100%"
            tableHead="Document List"
          />
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <DescriptionOutlinedIcon color="primary" />
            <Typography variant="h6">
              {editingDocument ? "Update Document" : "Upload Document"}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={dialogContentTop}>
            <TextField
              label="Document Name"
              value={form.document_name}
              onChange={(event) =>
                updateForm("document_name", event.target.value)
              }
              fullWidth
              required
              size="small"
            />
            <TextField
              label="Document Type"
              value={form.document_type}
              onChange={(event) =>
                updateForm("document_type", event.target.value as DocumentType)
              }
              fullWidth
              select
              size="small"
            >
              {documentTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Version"
              value={form.version}
              onChange={(event) => updateForm("version", event.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              fullWidth
              multiline
              minRows={3}
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
                startIcon={<UploadOutlinedIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
              <Typography variant="body2" color="text.secondary">
                {form.file?.name ||
                  (editingDocument
                    ? getFileName(editingDocument.file)
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
            onClick={submitDocument}
            disabled={saving}
            variant="contained"
            startIcon={
              saving ? undefined : editingDocument ? (
                <UpdateOutlinedIcon />
              ) : (
                <UploadOutlinedIcon />
              )
            }
          >
            {saving ? "Saving..." : editingDocument ? "Update" : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
