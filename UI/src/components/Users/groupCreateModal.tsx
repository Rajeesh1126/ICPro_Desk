import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import api from "../../api/axios";
import { showNotification } from "../../api/NotificationService";
import {
  modalActionButtonSx,
  modalFormActionsSx,
  modalFormContentSx,
  modalFormHeaderSx,
  modalFormPaperSx,
} from "../../styles/common";
import type { groupData } from "../../types/dataTypes";

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

const EMPTY_FORM: GroupFormData = {
  name: "",
};

export default function GroupCreateModal({
  open,
  handleClose,
  Data,
}: GroupCreateModalProps) {
  const [formData, setFormData] = useState<GroupFormData>(EMPTY_FORM);
  const [formErrorData, setFormErrorData] = useState<GroupFormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData(
      Data
        ? {
          name: Data.name || "",
        }
        : EMPTY_FORM,
    );
    setFormErrorData({});
  }, [Data, open]);

  const update = <K extends keyof GroupFormData>(
    field: K,
    value: GroupFormData[K],
  ) => {
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
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const errorText = (field: keyof GroupFormData) => {
    const error = formErrorData?.[field];
    if (Array.isArray(error)) {
      return error.join(" ");
    }
    if (typeof error === "string") {
      return error;
    }
    return undefined;
  };

  const invalid = !formData.name.trim();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: modalFormPaperSx }}
    >
      <DialogTitle component="div" sx={modalFormHeaderSx}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h6">
              {Data ? "Edit Team" : "Create Team"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure team details.
            </Typography>
          </Box>
          <IconButton
            aria-label="Close"
            onClick={handleClose}
            disabled={loading}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={modalFormContentSx}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
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
      <DialogActions sx={modalFormActionsSx}>
        <Button
          color="inherit"
          startIcon={<CloseRoundedIcon />}
          onClick={handleClose}
          disabled={loading}
          sx={modalActionButtonSx}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={Data ? <SaveRoundedIcon /> : <AddTaskRoundedIcon />}
          onClick={() => void submit()}
          disabled={loading || invalid}
          sx={modalActionButtonSx}
        >
          {loading ? "Saving..." : Data ? "Update" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
