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
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";

import api from "@/api/axios";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { showNotification } from "@/api/notificationService";
import { formatDateTime } from "@/components/common/formatDate";
import { getStoredPermissions } from "@/utils/permissions";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DialogHeader from "@/components/common/DialogHeader";
import ActionDivider from "@/components/common/ActionDivider";
import FileUploadField from "@/components/common/FileUploadField";
import {
  VirtualizedTable,
  type ColumnData,
} from "@/components/common/TableView";
import {
  buttonLabelCompact,
  buttonLabelFull,
  contentPanel,
  page,
  pageContent,
  deleteIconSx,
  rowDeleteButtonSx,
  documentNameCellSx,
} from "@/styles/common";
import PageHeader from "@/components/common/PageHeader";

type DocumentType = "FDS" | "SDS" | "Template" | "Other";

type DocumentTemplate = {
  id: number;
  document_name: string;
  document_type: DocumentType;
  version: string;
  orgin: string;
  file: string;
  uploaded_by_name: string | null;
  updated_at: string;
  is_active: boolean;
};

type DocumentFormState = {
  document_name: string;
  document_type: DocumentType;
  version: string;
  orgin: string;
  file: File | null;
};

const emptyForm: DocumentFormState = {
  document_name: "",
  document_type: "Template",
  version: "",
  orgin: "",
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

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const baseUrl = new URL(apiBaseUrl, window.location.origin).origin;
  return new URL(filePath, baseUrl).toString();
};

export default function Documents() {
  const permissions = getStoredPermissions();
  const canAddDocument = permissions.has("add_documenttemplate");
  const canChangeDocument = permissions.has("change_documenttemplate");
  const canDeleteDocument = permissions.has("delete_documenttemplate");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DocumentFormState>(emptyForm);
  const [editingDocument, setEditingDocument] =
    useState<DocumentTemplate | null>(null);
  const [deleteDocument, setDeleteDocument] = useState<DocumentTemplate | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  // Cached list: returning to this page shows the last rows immediately and
  // refreshes in the background. Successful saves/deletes refresh it
  // automatically (see invalidateAfterMutation), so dialogs never reload it.
  const listQuery = useApiQuery<DocumentTemplate[]>(
    "/documents/document-templates/",
  );
  console.log(listQuery.data);
  const documents = useMemo(
    () => asArray<DocumentTemplate>(listQuery.data),
    [listQuery.data],
  );
  const loading = listQuery.isPending;

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
      orgin: document.orgin || "",
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

  // Ask before discarding typed input (backdrop, Escape, X, Cancel).
  const discard = useDiscardGuard(dialogOpen, closeDialog);

  const updateForm = <K extends keyof DocumentFormState>(
    key: K,
    value: DocumentFormState[K],
  ) => {
    discard.markDirty();
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
    formData.append("orgin", form.orgin.trim());
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
    } catch {
      // The shared request error dialog explains the failure.
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

  const handleDeleteDocument = async () => {
    if (!deleteDocument) return;

    try {
      await api.delete(`/documents/document-templates/${deleteDocument.id}/`);
      showNotification({
        type: "success",
        message: "Document deleted successfully.",
      });
      setDeleteDocument(null);
    } catch {
      // The shared request error dialog explains the failure.
    }
  };

  const columns = useMemo<ColumnData<DocumentTemplate>[]>(
    () => [
      {
        label: "Document Name",
        dataKey: "document_name",
        width: "auto",
        wrap: true,
      },
      {
        label: "Orgin",
        dataKey: "orgin",
        width: 140,
        // format: "label",
      },
      {
        label: "Type",
        dataKey: "document_type",
        width: 110,
        format: "label",
      },
      {
        label: "Version",
        dataKey: "version",
        width: 80,
        // Stored as "2" or "v1"; always shown as "v2", "v1".
        render: (row) => {
          const version = String(row.version ?? "")
            .trim()
            .replace(/^v/i, "");
          return version ? `v${version}` : "—";
        },
      },
      {
        label: "File",
        width: "auto",
        render: (row) => {
          const name = getFileName(row.file);
          return (
            <Box
              component="span"
              title={name}
              sx={documentNameCellSx}
            >
              <InsertDriveFileOutlinedIcon aria-hidden="true" />
              <Box component="span">{name}</Box>
            </Box>
          );
        },
      },
      {
        label: "Uploaded By",
        dataKey: "uploaded_by_name",
        width: 150,
      },
      {
        label: "Updated Date",
        dataKey: "updated_at",
        width: 140,
        render: (row) => formatDateTime(row.updated_at),
      },
      {
        label: "Actions",
        width: 200,
        render: (row) => (
          <Stack direction="row" spacing={0}>
            <Tooltip title="Download document">
              <Button
                size="small"
                startIcon={<DownloadOutlinedIcon />}
                disabled={!row.file}
                onClick={() => downloadDocument(row)}
                aria-label={`Download ${row.document_name}`}
              >
                Download
              </Button>
            </Tooltip>

            <ActionDivider />
            
            {canChangeDocument && (
              <Tooltip title="Upload a new version">
                <IconButton
                  aria-label={`Upload new version of ${row.document_name ?? "document"}`}
                  color="primary"
                  onClick={() => openReplaceDialog(row)}
                >
                  <FileUploadOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <ActionDivider />
            
            {canDeleteDocument && (
              <Tooltip title="Delete document">
                <IconButton
                  sx={rowDeleteButtonSx}
                  aria-label={`Delete ${row.document_name ?? "document"}`}
                  onClick={() => setDeleteDocument(row)}
                >
                  <DeleteOutlinedIcon fontSize="small" sx={deleteIconSx} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ],
    [canChangeDocument, canDeleteDocument],
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <PageHeader
          title="Document Templates"
          subtitle="Manage FDS, SDS and reusable document templates."
          actions={[
            canAddDocument && {
              key: "upload",
              priority: "high",
              node: (
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
              ),
            },
          ]}
        />

        <Box sx={contentPanel}>
          <VirtualizedTable<DocumentTemplate>
            columns={columns}
            rows={documents}
            height="100%"
            fitContent
            tableHead="Documents"
            loading={loading}
            emptyTitle="No documents yet"
            emptyDescription="Upload an FDS, SDS or template to share it with the team."
          />
        </Box>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={discard.requestClose}
        onChangeCapture={discard.markDirty}
        fullWidth
        maxWidth="sm"
      >
        <DialogHeader
          title={editingDocument ? "Update Document" : "Upload Document"}
          onClose={discard.requestClose}
        />
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Document Name"
              value={form.document_name}
              onChange={(event) =>
                updateForm("document_name", event.target.value)
              }
              fullWidth
              required
            />
            <TextField
              label="Document Type"
              value={form.document_type}
              onChange={(event) =>
                updateForm("document_type", event.target.value as DocumentType)
              }
              fullWidth
              select
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
            />
            <TextField
              label="orgin"
              value={form.orgin}
              onChange={(event) => updateForm("orgin", event.target.value)}
              fullWidth
            />
            <FileUploadField
              file={form.file}
              onChange={(file) => updateForm("file", file)}
              existingFileName={
                editingDocument ? getFileName(editingDocument.file) : null
              }
              required={!editingDocument}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={submitDocument}
            disabled={saving}
            variant="contained"
            startIcon={
              saving ? undefined : editingDocument ? (
                <SaveOutlinedIcon />
              ) : (
                <CheckOutlinedIcon />
              )
            }
          >
            {saving ? "Saving..." : editingDocument ? "Update" : "Submit"}
          </Button>
        </DialogActions>
        {discard.dialog}
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteDocument)}
        onClose={() => setDeleteDocument(null)}
        title="Delete Document"
        description={`Delete "${deleteDocument?.document_name || "this document"}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        confirmIcon={<DeleteOutlinedIcon />}
        onConfirm={handleDeleteDocument}
      />
    </Box>
  );
}
