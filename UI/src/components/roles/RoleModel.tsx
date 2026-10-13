import { useDiscardGuard } from "../common/useDiscardGuard";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import api from "../../api/axios";
import { sanitizeUserMessage } from "../../utils/errorUtils";
import DialogHeader, { RequiredFieldsNote } from "../common/DialogHeader";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import type { rolesData } from "../../types/dataTypes";
import { showNotification } from "../../api/notificationService";

type RoleModelProps = {
  open: boolean;
  editing: boolean;
  Data: rolesData | null;
  handleClose: () => void;
};

interface RoleFormData {
  name: string;
  description: string;
}

export default function RoleModel({
  open,
  editing,
  Data,
  handleClose,
}: RoleModelProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
  });
  const [formErrorData, setFormErrorData] = useState<{
    name?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (Data) {
      setFormData({
        name: Data.name ?? "",
        description: Data.description ?? "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
    setFormErrorData({});
  }, [Data, open]);

  // Ask before discarding typed input (backdrop, Escape, X, Cancel).
  const discard = useDiscardGuard(open, handleClose);

  const update = <K extends keyof RoleFormData>(
    field: K,
    value: RoleFormData[K],
  ) => {
    discard.markDirty();
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "id") {
          payload.append(key, String(value));
        }
      });
      await api[Data ? "patch" : "post"](
        Data ? `/roles/${Data.id}/` : "/roles/",
        payload,
        {
          suppressGlobalError: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      handleClose();
      showNotification({
        type: "success",
        message: Data
          ? "Roles updated successfully."
          : "Roles created successfully.",
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "status" in error.response &&
        error.response.status === 400 &&
        "data" in error.response
      ) {
        setFormErrorData(
          error.response.data as Partial<Record<keyof RoleFormData, string>>,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : discard.requestClose}
      onChangeCapture={discard.markDirty}
      fullWidth
      maxWidth="md"
    >
      <DialogHeader
        title={editing ? "Edit Role" : "Create Role"}
        subtitle={
          editing
            ? "Update role details and permissions."
            : "Create a new role and configure its permissions."
        }
        onClose={discard.requestClose}
        closeDisabled={loading}
      />

      <DialogContent>
        <Stack spacing={2.25}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {" "}
              Role Details{" "}
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  label="Role Name"
                  fullWidth
                  value={formData.name}
                  onChange={(event) => update("name", event.target.value)}
                  error={!!formErrorData.name}
                  helperText={formErrorData.name ? sanitizeUserMessage(formErrorData.name) : undefined}
                  disabled={loading}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  label="Description"
                  multiline
                  minRows={5}
                  fullWidth
                  value={formData.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  error={!!formErrorData.description}
                  helperText={formErrorData.description ? sanitizeUserMessage(formErrorData.description) : undefined}
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </Box>
          <Divider />
        </Stack>
      </DialogContent>

      <DialogActions>
        <RequiredFieldsNote />

        <Button
          variant="outlined"
          startIcon={<CancelOutlinedIcon />}
          onClick={discard.requestClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={editing ? <UpdateOutlinedIcon /> : <SendOutlinedIcon />}
          onClick={() => void submit()}
          disabled={loading || !formData.name.trim()}
        >
          {loading ? "Saving..." : editing ? "Update" : "Submit"}
        </Button>
      </DialogActions>
      {discard.dialog}
    </Dialog>
  );
}
