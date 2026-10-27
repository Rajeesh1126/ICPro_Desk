import { useDiscardGuard } from "@/components/common/useDiscardGuard";
import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
} from "@mui/material";
import DialogHeader, { RequiredFieldsNote } from "@/components/common/DialogHeader";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

import api from "@/api/axios";
import { sanitizeUserMessage } from "@/utils/errorUtils";
import { showNotification } from "@/api/notificationService";

import type { groupData } from "@/types/dataTypes";
import {
  topSpacingSx,
} from "@/styles/common";

type GroupFormData = {
  name: string;
};

type GroupFormErrors = Partial<Record<keyof GroupFormData, string | string[]>>;

type GroupCreateModalProps = {
  open: boolean;
  handleClose: () => void;
  Data: groupData | null;
};

type ValidationErrorResponse = {
  response?: {
    status?: number;
    data?: GroupFormErrors;
  };
};

function isValidationErrorResponse(error: unknown): error is ValidationErrorResponse {
  return typeof error === "object" && error !== null && "response" in error;
}

const emptyForm: GroupFormData = {
  name: "",
};

export default function GroupCreateModal({
  open,
  handleClose,
  Data,
}: GroupCreateModalProps) {
  const [formData, setFormData] = useState<GroupFormData>(emptyForm);
  const [formErrorData, setFormErrorData] = useState<GroupFormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData(
      Data
        ? {
          name: Data.name || "",
        }
        : emptyForm,
    );
    setFormErrorData({});
  }, [Data, open]);

  // Ask before discarding typed input (backdrop, Escape, X, Cancel).
  const discard = useDiscardGuard(open, handleClose);

  const update = <K extends keyof GroupFormData>(
    field: K,
    value: GroupFormData[K],
  ) => {
    discard.markDirty();
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
      };

      await api[Data ? "patch" : "post"](
        Data ? `/groups/${Data.id}/` : "/groups/",
        payload,
        { suppressGlobalError: true },
      );

      handleClose();
      showNotification({
        type: "success",
        message: Data ? "Team updated successfully." : "Team created successfully.",
      });
      setFormErrorData({});
    } catch (error: unknown) {
      if (isValidationErrorResponse(error) && error.response?.status === 400) {
        setFormErrorData(error.response.data ?? {});
      }
    } finally {
      setLoading(false);
    }
  };

  const errorText = (field: keyof GroupFormData) => {
    const error = formErrorData?.[field];
    if (Array.isArray(error)) {
      return sanitizeUserMessage(error.join(" "));
    }
    if (typeof error === "string") {
      return sanitizeUserMessage(error);
    }
    return undefined;
  };

  const invalid = !formData.name.trim();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : discard.requestClose}
      onChangeCapture={discard.markDirty}
      fullWidth
      maxWidth="sm"
    >
      <DialogHeader
        title={Data ? "Edit Team" : "Create Team"}
        subtitle="Configure team details."
        onClose={discard.requestClose}
        closeDisabled={loading}
      />
      <DialogContent>
        <Grid container spacing={2} sx={topSpacingSx}>
          <Grid size={{ xs: 12 }}>
            <TextField
              required
              autoFocus
              label="Team Name"
              fullWidth
              value={formData.name}
              onChange={(event) => update("name", event.target.value)}
              error={!!formErrorData?.name}
              helperText={errorText("name")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <RequiredFieldsNote />
        <Button
          variant="contained"
          startIcon={Data ? <SaveOutlinedIcon /> : <CheckOutlinedIcon />}
          onClick={() => void submit()}
          disabled={loading || invalid}
        >
          {loading ? "Saving..." : Data ? "Update" : "Submit"}
        </Button>
      </DialogActions>
      {discard.dialog}
    </Dialog>
  );
}
