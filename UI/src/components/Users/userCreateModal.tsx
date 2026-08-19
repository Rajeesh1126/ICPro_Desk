import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import api from "../../api/axios";
import type {
  UsersFormData,
  rolesData,
  UsersData,
  groupData,
} from "../../types/dataTypes";
import {
  modalActionButtonSx,
  modalFormActionsSx,
  modalFormContentSx,
  modalFormHeaderSx,
  modalFormPaperSx,
  selfTicketsCreateModelFormControlLabelSx1,
} from "../../styles/common";
import { showNotification } from "../../api/NotificationService";

type userCreateModalProps = {
  open: boolean;
  handleClose: () => void;
  Data: UsersData | null;
};

type ValidationErrorResponse = {
  response?: {
    status?: number;
    data?: Partial<UsersFormData>;
  };
};

function isValidationErrorResponse(error: unknown): error is ValidationErrorResponse {
  return typeof error === "object" && error !== null && "response" in error;
}

const EMPTY_FORM: UsersFormData = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  reporting_to: "",
  location: "",
  role: "",
  designation: "",
  groups: [],
  resign_date: null,
  is_active: true
};

function loggedUser(): number | null {
  const value = localStorage.getItem("user");
  const id = value ? Number(value) : NaN;

  return Number.isInteger(id) ? id : null;
}

export default function userCreateModal({
  open,
  handleClose,
  Data,
}: userCreateModalProps) {
  const [formData, setFormData] = useState<UsersFormData>(EMPTY_FORM);
  const [formErrorData, setFormErrorData] = useState<Partial<UsersFormData>>();
  const [users, setUsers] = useState<UsersData[]>([]);
  const [roles, setRoles] = useState<rolesData[]>([]);
  const [groups, setGroups] = useState<groupData[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!open) return;
    setFormData(
      Data
        ? {
          first_name: Data.first_name || "",
          last_name: Data.last_name || "",
          username: Data.username || "",
          email: Data.email || "",
          reporting_to: Data.reporting_to || "",
          location: Data.location || "",
          role: Data.role || "",
          designation: Data.designation || "",
          groups: Data.groups || [],
          resign_date: Data.resign_date || null,
          is_active: Data.is_active ?? true,
          exe_role: Data.exe_role ?? false,
        }
        : EMPTY_FORM,
    );
    setChecked(Data?.exe_role ?? false);
    setConfirmPassword("");
    setFormErrorData({});
  }, [Data, open]);

  // users Data
  useEffect(() => {
    if (!open) return;
    let active = true;
    void api
      .get("/users/")
      .then((response) => {
        if (!active) return;
        const source = (
          Array.isArray(response.data) ? response.data : []
        ) as UsersData[];
        setUsers(source.filter((user) => user.id !== loggedUser()));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [open]);

  // role Data
  useEffect(() => {
    if (!open) return;
    let active = true;
    void api
      .get("/roles/")
      .then((response) => {
        if (!active) return;
        setRoles(response.data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [open]);

  // Group Data
  useEffect(() => {
    if (!open) return;
    let active = true;
    void api
      .get("/groups/")
      .then((response) => {
        if (!active) return;
        setGroups(response.data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [open]);
  const update = <K extends keyof UsersFormData>(
    field: K,
    value: UsersFormData[K],
  ) => { setFormData((current) => ({ ...current, [field]: value })); };

  const submit = async () => {
    setLoading(true);

    try {
      const payload = Object.entries(formData).reduce<Record<string, unknown>>(
        (data, [key, value]) => {
          if (key !== "id" && value !== "" && value != null) {
            data[key] = value;
          }
          return data;
        },
        {},
      );

      if (formData.is_active) {
        payload.resign_date = null;
      }

      if (!formData.exe_role) {
        payload.groups = [];
      }

      await api[Data ? "patch" : "post"](
        Data ? `/users/${Data.id}/` : "/users/",
        payload,
      );

      handleClose();
      showNotification({
        type: "success",
        message: Data ? "User updated successfully." : "User created successfully.",
      });
      setFormErrorData({});
    } catch (error: unknown) {
      if (isValidationErrorResponse(error) && error.response?.status === 400) {
        setFormErrorData(error.response.data);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const errorText = (field: keyof UsersFormData) => {
    const error = formErrorData?.[field];
    if (Array.isArray(error)) {
      return error.join(" ");
    }
    if (typeof error === "string") {
      return error;
    }
    return undefined;
  };

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
 
  const invalid =
    !formData.username ||
    (!Data && (!formData.password || formData.password !== confirmPassword))

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      fullWidth
      maxWidth="md"
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
              {Data ? "Edit User" : "Create User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure user account details.
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

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="First Name"
              fullWidth
              value={formData.first_name}
              onChange={(event) => update("first_name", event.target.value)}
              error={!!formErrorData?.first_name}
              helperText={errorText("first_name")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Last Name"
              fullWidth
              value={formData.last_name}
              onChange={(event) => update("last_name", event.target.value)}
              error={!!formErrorData?.last_name}
              helperText={errorText("last_name")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              label="EID/User Name"
              fullWidth
              value={formData.username}
              onChange={(event) => update("username", event.target.value)}
              error={!!formErrorData?.username}
              helperText={errorText("username")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              fullWidth
              value={formData.email}
              onChange={(event) => update("email", event.target.value)}
              error={!!formErrorData?.email}
              helperText={errorText("email")}
            />
          </Grid>


          {!Data && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={
                    !!formErrorData?.password ||
                    (!!confirmPassword && formData.password !== confirmPassword)
                  }
                  helperText={
                    formData.password !== confirmPassword && confirmPassword
                      ? "Passwords do not match."
                      : errorText("password")
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.password}
                  onChange={(event) => update("password", event.target.value)}
                  error={!!formErrorData?.password}
                  helperText={errorText("password")}
                />
              </Grid>
            </>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl  fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(event) => update("role", event.target.value)}
              >
                {roles.map((item) => (
                  <MenuItem
                    key={`${item.id}`}
                    value={item.name}
                  >
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Designation"
              fullWidth
              value={formData.designation}
              onChange={(event) => update("designation", event.target.value)}
              error={!!formErrorData?.designation}
              helperText={errorText("designation")}
            />
          </Grid>


          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl  fullWidth>
              <InputLabel>Reporting To</InputLabel>
              <Select
                value={formData.reporting_to}
                label="Reporting To"
                onChange={(event) => update("reporting_to", event.target.value)}
              >
                {users.map((user) => (
                  <MenuItem
                    key={`${user.id}`}
                    value={user.username}
                  >
                    {user.first_name || user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={formData.location}
                label="Location"
                onChange={(event) => update("location", event.target.value)}
              >
                <MenuItem value="kochi">Kochi</MenuItem>
                <MenuItem value="banglore">Banglore</MenuItem>
                <MenuItem value="singapore">Singapore</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControlLabel
              label="Executive Role"
              control={
                <Checkbox
                  checked={checked}
                  onChange={(event) => {
                    const isChecked = event.target.checked;
                    setChecked(isChecked);
                    update("exe_role", isChecked);
                    if (!isChecked) {
                      update("groups", []);
                    }
                  }}
                />
              }
              sx={selfTicketsCreateModelFormControlLabelSx1}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl  fullWidth>
              <InputLabel>Teams</InputLabel>
              <Select
                multiple
                value={formData.groups || []}
                label="Teams"
                disabled={!checked}
                onChange={(event) => {
                  const value = event.target.value;

                  update(
                    "groups",
                    typeof value === "string"
                      ? value.split(",")
                      : value
                  );
                }}
                renderValue={(selected) =>
                  (selected as string[]).join(", ")
                }
              >
                {groups.map((item) => (
                  <MenuItem key={item.id} value={item.name}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControlLabel
              label="Active"
              control={
                <Checkbox
                  checked={formData.is_active ?? true}
                  onChange={(event) => update("is_active", event.target.checked)}
                />
              }
              sx={selfTicketsCreateModelFormControlLabelSx1}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Resigned date"
              type="date"
              fullWidth
              disabled={formData.is_active}
              value={formData.resign_date || ""}
              onChange={(event) => update("resign_date", event.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: tomorrow },
              }}
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
          {loading ? "Saving…" : Data ? "Update" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
