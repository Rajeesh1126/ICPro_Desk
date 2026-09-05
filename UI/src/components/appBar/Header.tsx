import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { alpha, type Theme } from "@mui/material/styles";
import logo from "../../assets/icpro_logo.svg";
import pdfFile from "../../assets/Work_Wise_Process_Flow.pdf";
import api from "../../api/axios";
import { showNotification } from "../../api/notificationService";
import { useThemeMode } from "../../styles/theme/themeModeContext";
import {
  appBarHeaderAvatarSx1,
  appBarHeaderBoxSx1,
  appBarHeaderBoxSx2,
  appBarHeaderBoxSx3,
  appBarHeaderBoxSx4,
  appBarHeaderCallbackCallbackSx1,
  appBarHeaderCallbackCallbackSx2,
  appBarHeaderCallbackCallbackSx3,
  appBarHeaderCallbackCallbackSx4,
  appBarHeaderCallbackCallbackSx5,
  appBarHeaderCallbackCallbackSx6,
  appBarHeaderContainerSx1,
  appBarHeaderDynamicDynamicAppBarSx1,
  appBarHeaderDynamicDynamicAvatarSx1,
  appBarHeaderIconButtonSx1,
  appBarHeaderIconButtonSx2,
  appBarHeaderProfileBodySx,
  appBarHeaderProfileCardSx,
  appBarHeaderProfileDetailRowSx,
  appBarHeaderProfileFooterButtonSx,
  appBarHeaderProfileHeaderSx,
  appBarHeaderProfileInfoIconSx,
  appBarHeaderProfileMetaSx,
  appBarHeaderProfileTextSx,
  appBarHeaderProfileValueSx,
  appBarHeaderToolbarSx1,
  appBarHeaderTypographySx3,
  appBarHeaderTypographySx4,
  dialogContentTop,
  marginTopMediumSx,
  marginTopSmallSx,
  pushRightSx,
} from "../../styles/common";
import type { NotificationsType } from "../../types/dataTypes";

const emptyNotifications: NotificationsType = {
  selfticketOpenCount: 0,
  ticketOpenCount: 0,
};

const coloredIconButtonSx =
  (color: "primary" | "info" | "warning" | "secondary" | "error" | "muted") =>
  (theme: Theme) => {
    const iconColor =
      color === "muted"
        ? theme.palette.text.secondary
        : theme.palette[color].main;

    return {
      color: iconColor,
      "&:hover": {
        bgcolor: alpha(iconColor, theme.palette.mode === "dark" ? 0.18 : 0.1),
      },
    };
  };

const menuButtonSx = (theme: Theme) => ({
  ...(appBarHeaderIconButtonSx1 as object),
  ...coloredIconButtonSx("primary")(theme),
  alignItems: "center",
  alignSelf: "center",
  height: 40,
  justifyContent: "center",
  p: 0,
  width: 32,
  "&:hover": {
    bgcolor: "transparent",
  },
});

const accountButtonSx = {
  ...appBarHeaderIconButtonSx2,
  "&&": { ml: 2 },
};

const notificationMenuPaperSx = (theme: Theme) => ({
  width: "min(360px, calc(100vw - 24px))",
  mt: 1.25,
  overflow: "hidden",
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 18px 48px rgba(0, 0, 0, 0.42)"
      : "0 18px 48px rgba(15, 23, 42, 0.14)",
});

const profileMenuPaperSx = (theme: Theme) => ({
  width: "min(420px, calc(100vw - 24px))",
  maxHeight: "calc(100dvh - 96px)",
  mt: 2.5,
  overflow: "hidden",
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 18px 48px rgba(0, 0, 0, 0.42)"
      : "0 18px 48px rgba(15, 23, 42, 0.14)",
});

const menuListSx = { p: 0 };

type StoredPermission = {
  id?: number;
  name?: string;
  codename?: string;
};

type StoredRole = {
  id?: number;
  name?: string;
  permissions?: StoredPermission[];
};

type StoredUser = {
  id?: number;
  username?: string;
  full_name?: string;
  email?: string;
  is_staff?: boolean;
  groups?: string[];
  role?: StoredRole[];
};

function getStoredUser(): StoredUser {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("currentUser") ??
        localStorage.getItem("user") ??
        "{}",
    );
    return typeof value === "object" && value !== null
      ? (value as StoredUser)
      : {};
  } catch {
    return {};
  }
}

type ResponsiveAppBarProps = {
  onMenuClick?: () => void;
};

type ChangePasswordForm = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

type ChangePasswordErrors = Partial<
  Record<keyof ChangePasswordForm | "non_field_errors" | "detail", string | string[]>
>;

type ChangePasswordErrorResponse = {
  response?: {
    status?: number;
    data?: ChangePasswordErrors;
  };
};

const emptyPasswordForm: ChangePasswordForm = {
  old_password: "",
  new_password: "",
  confirm_password: "",
};

function isChangePasswordErrorResponse(
  error: unknown,
): error is ChangePasswordErrorResponse {
  return typeof error === "object" && error !== null && "response" in error;
}

function formatPasswordError(error?: string | string[]) {
  if (Array.isArray(error)) {
    return error.join(" ");
  }

  return error;
}

export default function ResponsiveAppBar({
  onMenuClick,
}: ResponsiveAppBarProps) {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const [notificationAnchor, setNotificationAnchor] =
    useState<HTMLElement | null>(null);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [notifications] = useState<NotificationsType>(emptyNotifications);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] =
    useState<ChangePasswordForm>(emptyPasswordForm);
  const [passwordErrors, setPasswordErrors] = useState<ChangePasswordErrors>(
    {},
  );
  const [changingPassword, setChangingPassword] = useState(false);

  // useEffect(() => {
  //   let active = true;
  //   void api
  //     .get("/notifications/")
  //     .then((response) => {
  //       if (!active) return;
  //       setNotifications(response.data ?? emptyNotifications);
  //     })
  //     .catch(() => undefined);
  //   return () => {
  //     active = false;
  //   };
  // }, []);

  const currentUser = getStoredUser();
  const loggedUser =
    localStorage.getItem("first_name") ||
    currentUser.full_name ||
    currentUser.username ||
    "";
  const role =
    localStorage.getItem("role") ||
    (Array.isArray(currentUser.role)
      ? currentUser.role
          .map((item) => item.name)
          .filter(Boolean)
          .join(", ")
      : "");
  const userGroups = Array.isArray(currentUser.groups)
    ? currentUser.groups
    : [];

  const totalNotifications =
    notifications.selfticketOpenCount + notifications.ticketOpenCount;

  const downloadProcessFlow = () => {
    const link = document.createElement("a");
    link.href = pdfFile;
    link.download = "Work_Wise_Process_Flow.pdf";
    link.click();
  };

  const logout = () => {
    localStorage.clear();
    setProfileAnchor(null);
    navigate("/", { replace: true });
  };

  const openChangePasswordDialog = () => {
    setProfileAnchor(null);
    setPasswordForm(emptyPasswordForm);
    setPasswordErrors({});
    setChangePasswordOpen(true);
  };

  const closeChangePasswordDialog = () => {
    if (changingPassword) return;
    setChangePasswordOpen(false);
    setPasswordForm(emptyPasswordForm);
    setPasswordErrors({});
  };

  const updatePasswordForm = <K extends keyof ChangePasswordForm>(
    key: K,
    value: ChangePasswordForm[K],
  ) => {
    const sanitizedValue = value.replace(/\s/g, "");

    setPasswordForm((current) => ({ ...current, [key]: sanitizedValue }));
    setPasswordErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submitChangePassword = async () => {
    if (
      !passwordForm.old_password ||
      !passwordForm.new_password ||
      !passwordForm.confirm_password
    ) {
      showNotification({
        type: "warning",
        message:
          "Current password, new password and confirmation are required.",
      });
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showNotification({
        type: "warning",
        message: "New password and confirm password do not match.",
      });
      return;
    }

    setChangingPassword(true);
    setPasswordErrors({});
    try {
      await api.post("/users/change_password/", passwordForm);
      showNotification({
        type: "success",
        message: "Password changed successfully. Please login again.",
      });
      logout();
    } catch (error: unknown) {
      if (isChangePasswordErrorResponse(error) && error.response?.status === 400) {
        const errors = error.response.data ?? {};

        setPasswordErrors(errors);

        const generalError =
          formatPasswordError(errors.non_field_errors) ||
          formatPasswordError(errors.detail);

        if (generalError) {
          showNotification({
            type: "error",
            message: generalError,
          });
        }
      } else {
        throw error;
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={appBarHeaderDynamicDynamicAppBarSx1}
    >
      <Container maxWidth={false} sx={appBarHeaderContainerSx1}>
        <Toolbar disableGutters sx={appBarHeaderToolbarSx1}>
          <Box component={RouterLink} to="/Home" sx={appBarHeaderBoxSx1}>
            <Box
              component="img"
              src={logo}
              alt="ICPro"
              sx={appBarHeaderBoxSx2}
            />
          </Box>

          <IconButton
            aria-label="Open navigation"
            onClick={onMenuClick}
            sx={menuButtonSx}
          >
            <MenuOutlinedIcon />
          </IconButton>

          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 0, sm: 0.5 }}
            sx={pushRightSx}
          >
            <Tooltip title="Process flow">
              <IconButton
                aria-label="Download process flow"
                onClick={downloadProcessFlow}
                sx={coloredIconButtonSx("info")}
              >
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              <IconButton
                aria-label={
                  mode === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                onClick={toggleMode}
                sx={coloredIconButtonSx(
                  mode === "dark" ? "warning" : "secondary",
                )}
              >
                {mode === "dark" ? (
                  <LightModeOutlinedIcon />
                ) : (
                  <DarkModeOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                totalNotifications
                  ? `${totalNotifications} action items`
                  : "No notifications"
              }
            >
              <IconButton
                aria-label="Notifications"
                onClick={(event) => setNotificationAnchor(event.currentTarget)}
                sx={coloredIconButtonSx(totalNotifications ? "error" : "muted")}
              >
                <Badge badgeContent={totalNotifications} color="error">
                  <NotificationsOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Account">
              <IconButton
                aria-label="Account menu"
                onClick={(event) => setProfileAnchor(event.currentTarget)}
                sx={accountButtonSx}
              >
                <Avatar sx={appBarHeaderAvatarSx1}>
                  {loggedUser?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </Container>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: notificationMenuPaperSx,
          },
          list: { sx: menuListSx },
        }}
      >
        <Box sx={appBarHeaderCallbackCallbackSx1({ alpha })}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
          >
            <Box minWidth={0}>
              <Typography fontWeight={900} lineHeight={1.15}>
                Notifications
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={marginTopSmallSx}
              >
                {totalNotifications
                  ? `${totalNotifications} action item${totalNotifications === 1 ? "" : "s"} need attention`
                  : "You are all caught up"}
              </Typography>
            </Box>
            <Box sx={appBarHeaderCallbackCallbackSx2({ alpha })}>
              <Badge badgeContent={totalNotifications} color="error">
                <NotificationsOutlinedIcon fontSize="small" />
              </Badge>
            </Box>
          </Stack>
        </Box>
        <Divider />
        {totalNotifications === 0 ? (
          <Box sx={appBarHeaderBoxSx3}>
            <Typography fontWeight={800}>No notifications</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={marginTopMediumSx}
            >
              New ticket updates will appear here.
            </Typography>
          </Box>
        ) : (
          [
            <MenuItem
              key="self-tickets"
              component={RouterLink}
              to="/Home/SelfTickets"
              onClick={() => setNotificationAnchor(null)}
              sx={appBarHeaderCallbackCallbackSx3({ alpha })}
            >
              <Box sx={appBarHeaderCallbackCallbackSx4({ alpha })}>
                <FormatListBulletedOutlinedIcon fontSize="small" />
              </Box>
              <Box minWidth={0} sx={appBarHeaderBoxSx4}>
                <Typography fontWeight={900} lineHeight={1.15}>
                  Do List
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Self tickets waiting for action
                </Typography>
              </Box>
              <Badge
                badgeContent={notifications.selfticketOpenCount}
                color="primary"
              />
            </MenuItem>,
            <MenuItem
              key="tickets"
              component={RouterLink}
              to="/Home/Tickets"
              onClick={() => setNotificationAnchor(null)}
              sx={appBarHeaderCallbackCallbackSx5({ alpha })}
            >
              <Box sx={appBarHeaderCallbackCallbackSx6({ alpha })}>
                <TaskAltOutlinedIcon fontSize="small" />
              </Box>
              <Box minWidth={0} sx={appBarHeaderBoxSx4}>
                <Typography fontWeight={900} lineHeight={1.15}>
                  Tickets
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Assigned ticket updates
                </Typography>
              </Box>
              <Badge
                badgeContent={notifications.ticketOpenCount}
                color="primary"
              />
            </MenuItem>,
          ]
        )}
      </Menu>

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: profileMenuPaperSx,
          },
          list: {
            sx: menuListSx,
          },
        }}
      >
        <Box sx={appBarHeaderProfileBodySx}>
          <Box sx={appBarHeaderProfileCardSx({ alpha })}>
            <Box sx={appBarHeaderProfileHeaderSx}>
              <Avatar sx={appBarHeaderDynamicDynamicAvatarSx1({ alpha })}>
                {loggedUser?.charAt(0).toUpperCase()}
              </Avatar>
              <Stack spacing={0.5} sx={appBarHeaderProfileTextSx}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={appBarHeaderTypographySx3}
                >
                  {currentUser.username || "Signed in"}
                </Typography>
                <Typography fontWeight={800} sx={appBarHeaderTypographySx4}>
                  {loggedUser?.toUpperCase()}
                </Typography>
                {currentUser.email && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={appBarHeaderTypographySx4}
                  >
                    {currentUser.email}
                  </Typography>
                )}
              </Stack>
            </Box>

            <Stack spacing={1} sx={appBarHeaderProfileMetaSx}>
              <Box sx={appBarHeaderProfileDetailRowSx}>
                <Box
                  sx={appBarHeaderProfileInfoIconSx({
                    alpha,
                    color: "secondary",
                  })}
                >
                  <AdminPanelSettingsOutlinedIcon fontSize="small" />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={900}
                >
                  Role
                </Typography>
                <Box sx={appBarHeaderProfileValueSx}>
                  <Chip
                    label={role || "No roles assigned"}
                    size="small"
                    color="secondary"
                  />
                </Box>
              </Box>

              <Box sx={appBarHeaderProfileDetailRowSx}>
                <Box
                  sx={appBarHeaderProfileInfoIconSx({ alpha, color: "info" })}
                >
                  <GroupsOutlinedIcon fontSize="small" />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={900}
                >
                  Groups
                </Typography>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={0.75}
                  sx={appBarHeaderProfileValueSx}
                >
                  {userGroups.length ? (
                    userGroups.map((group) => (
                      <Chip
                        key={group}
                        label={group}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No groups assigned
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>

            <Divider />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={appBarHeaderProfileMetaSx}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LockResetOutlinedIcon />}
                onClick={openChangePasswordDialog}
                sx={appBarHeaderProfileFooterButtonSx}
              >
                Change password
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="error"
                startIcon={<LogoutOutlinedIcon />}
                onClick={logout}
                sx={appBarHeaderProfileFooterButtonSx}
              >
                Logout
              </Button>
            </Stack>
          </Box>
        </Box>
      </Menu>

      <Dialog
        open={changePasswordOpen}
        onClose={closeChangePasswordDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <LockResetOutlinedIcon color="primary" />
            <Typography variant="h6">Change Password</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={dialogContentTop}>
            <TextField
              label="Current Password"
              type="password"
              value={passwordForm.old_password}
              onChange={(event) =>
                updatePasswordForm("old_password", event.target.value)
              }
              fullWidth
              required
              size="small"
              autoComplete="current-password"
              error={Boolean(passwordErrors.old_password)}
              helperText={formatPasswordError(passwordErrors.old_password)}
            />
            <TextField
              label="New Password"
              type="password"
              value={passwordForm.new_password}
              onChange={(event) =>
                updatePasswordForm("new_password", event.target.value)
              }
              fullWidth
              required
              size="small"
              autoComplete="new-password"
              error={Boolean(passwordErrors.new_password)}
              helperText={formatPasswordError(passwordErrors.new_password)}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={passwordForm.confirm_password}
              onChange={(event) =>
                updatePasswordForm("confirm_password", event.target.value)
              }
              fullWidth
              required
              size="small"
              autoComplete="new-password"
              error={Boolean(passwordErrors.confirm_password)}
              helperText={formatPasswordError(passwordErrors.confirm_password)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={closeChangePasswordDialog}
            disabled={changingPassword}
            startIcon={<CancelOutlinedIcon />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitChangePassword}
            disabled={changingPassword}
            startIcon={changingPassword ? undefined : <LockResetOutlinedIcon />}
          >
            {changingPassword ? "Changing..." : "Change"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}
