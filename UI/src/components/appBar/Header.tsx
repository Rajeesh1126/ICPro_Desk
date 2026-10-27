import { useState, type ReactNode } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { alpha } from "@mui/material/styles";
import pdfFile from "@/assets/Work_Wise_Process_Flow.pdf";
import logo from "@/assets/icpro_logo.svg";
import api from "@/api/axios";
import { sanitizeUserMessage } from "@/utils/errorUtils";
import { showNotification } from "@/api/notificationService";
import { useThemeMode } from "@/styles/theme/themeModeContext";
import DialogHeader from "@/components/common/DialogHeader";
import {
  headerAvatarSx,
  notificationEmptyStateSx,
  notificationItemTextSx,
  notificationMenuHeaderSx,
  notificationMenuHeaderIconSx,
  notificationMenuSelfTicketItemSx,
  notificationMenuSelfTicketIconSx,
  notificationMenuTicketItemSx,
  notificationMenuTicketIconSx,
  headerBarSx,
  headerIconButtonSx,
  headerThemeToggleSx,
  headerLogoImageSx,
  headerLogoLinkSx,
  headerMenuListSx,
  headerNavButtonSx,
  headerNotificationMenuPaperSx,
  headerProfileMenuPaperSx,
  headerAccountAvatarSx,
  headerAccountChevronSx,
  headerAccountNameSx,
  headerAccountRoleSx,
  headerAccountTextSx,
  headerAccountTriggerSx,
  appBarHeaderProfileBodySx,
  appBarHeaderProfileCardSx,
  appBarHeaderProfileDetailRowSx,
  appBarHeaderProfileFooterButtonSx,
  headerDesktopActionSx,
  headerPhoneMenuButtonSx,
  appBarHeaderProfileHeaderSx,
  appBarHeaderProfileInfoIconSx,
  appBarHeaderProfileMetaSx,
  appBarHeaderProfileTextSx,
  appBarHeaderProfileValueSx,
  profileUsernameSx,
  profileTruncatedTextSx,
  marginTopMediumSx,
  marginTopSmallSx,
  pushRightSx,
} from "@/styles/common";
import type { NotificationsType } from "@/types/dataTypes";
import { clearSession } from "@/api/session";

const emptyNotifications: NotificationsType = {
  selfticketOpenCount: 0,
  ticketOpenCount: 0,
};

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
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  designation?: string;
  reporting_to_first_name?: string;
  reporting_to_last_name?: string;
  is_staff?: boolean;
  role?: string | StoredRole[];
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

/** One labelled line in the profile menu (icon, label, value). */
function ProfileDetail({
  icon,
  color = "primary",
  label,
  children,
}: {
  icon: ReactNode;
  color?: "primary" | "secondary" | "info";
  label: string;
  children: ReactNode;
}) {
  return (
    <Box sx={appBarHeaderProfileDetailRowSx}>
      <Box sx={appBarHeaderProfileInfoIconSx({ color })}>{icon}</Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Box sx={appBarHeaderProfileValueSx}>{children}</Box>
    </Box>
  );
}

/** Profile text value with a dash when the corresponding login field is empty. */
function ProfileValue({ value }: { value?: string | null }) {
  return (
    <Typography
      variant="body2"
      fontWeight={600}
      title={value || undefined}
      sx={profileTruncatedTextSx}
      color={value ? "text.primary" : "text.secondary"}
    >
      {value || "—"}
    </Typography>
  );
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
    return sanitizeUserMessage(error.join(" "));
  }

  return error ? sanitizeUserMessage(error) : undefined;
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
  const [showPasswords, setShowPasswords] = useState({ old: false, next: false, confirm: false });

  const currentUser = getStoredUser();
  const firstName = currentUser.first_name || localStorage.getItem("first_name") || "";
  const lastName = currentUser.last_name || "";
  const loggedUser =
    [firstName, lastName].filter(Boolean).join(" ") ||
    currentUser.full_name ||
    currentUser.username ||
    "";
  const avatarInitials = [firstName, lastName]
    .filter(Boolean)
    .map((name) => name.charAt(0).toUpperCase())
    .join("") || loggedUser.charAt(0).toUpperCase();
  const role =
    localStorage.getItem("role") ||
    (Array.isArray(currentUser.role)
      ? currentUser.role
          .map((item) => item.name)
          .filter(Boolean)
          .join(", ")
      : "");
  const reportingTo = [
    currentUser.reporting_to_first_name,
    currentUser.reporting_to_last_name,
  ].filter(Boolean).join(" ");

  const totalNotifications =
    notifications.selfticketOpenCount + notifications.ticketOpenCount;

  const downloadProcessFlow = () => {
    const link = document.createElement("a");
    link.href = pdfFile;
    link.download = "Work_Wise_Process_Flow.pdf";
    link.click();
  };

  const logout = () => {
    clearSession();
    setProfileAnchor(null);
    navigate("/", { replace: true });
  };

  const openChangePasswordDialog = () => {
    setProfileAnchor(null);
    setPasswordForm(emptyPasswordForm);
    setPasswordErrors({});
    setShowPasswords({ old: false, next: false, confirm: false });
    setChangePasswordOpen(true);
  };

  const closeChangePasswordDialog = () => {
    if (changingPassword) return;
    setChangePasswordOpen(false);
    setPasswordForm(emptyPasswordForm);
    setPasswordErrors({});
    setShowPasswords({ old: false, next: false, confirm: false });
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
      await api.post("/users/change_password/", passwordForm, {
        suppressGlobalError: true,
      });
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
          showNotification({ type: "error", message: sanitizeUserMessage(generalError) });
        }
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      <Box sx={headerBarSx}>
          <IconButton
            aria-label="Open navigation"
            onClick={onMenuClick}
            sx={headerNavButtonSx}
          >
            <MenuOutlinedIcon />
          </IconButton>

          <Box
            component={RouterLink}
            to="/Home"
            aria-label="ICPro home"
            sx={headerLogoLinkSx}
          >
            <Box
              component="img"
              src={logo}
              alt="ICPro"
              sx={headerLogoImageSx}
            />
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 0, sm: 0.5 }}
            sx={pushRightSx}
          >
            <Tooltip title="Download process flow">
              <IconButton
                aria-label="Download process flow"
                onClick={downloadProcessFlow}
                sx={[headerIconButtonSx, headerDesktopActionSx]}
              >
                <DescriptionOutlinedIcon />
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
                sx={headerThemeToggleSx}
              >
                {mode === "dark" ? (
                  <LightModeIcon />
                ) : (
                  <DarkModeIcon />
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
                sx={headerIconButtonSx}
              >
                {totalNotifications > 0 ? (
                  <Badge badgeContent={totalNotifications} color="error">
                    <NotificationsOutlinedIcon />
                  </Badge>
                ) : (
                  <NotificationsOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Account settings">
              <Button
                id="account-menu-button"
                aria-label="Account menu"
                aria-controls={profileAnchor ? "account-menu" : undefined}
                aria-expanded={profileAnchor ? "true" : undefined}
                aria-haspopup="menu"
                onClick={(event) => setProfileAnchor(event.currentTarget)}
                endIcon={<KeyboardArrowDownRoundedIcon sx={headerAccountChevronSx(Boolean(profileAnchor))} />}
                sx={headerAccountTriggerSx(Boolean(profileAnchor))}
              >
                <Avatar sx={headerAccountAvatarSx}>
                  {avatarInitials}
                </Avatar>
                <Stack sx={headerAccountTextSx}>
                  <Typography variant="body2" sx={headerAccountNameSx}>
                    {loggedUser || "Account"}
                  </Typography>
                  <Typography variant="caption" sx={headerAccountRoleSx}>
                    {role || "Account settings"}
                  </Typography>
                </Stack>
              </Button>
            </Tooltip>
          </Stack>
      </Box>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: headerNotificationMenuPaperSx,
          },
          list: { sx: headerMenuListSx },
        }}
      >
        <Box sx={notificationMenuHeaderSx({ alpha })}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
          >
            <Box minWidth={0}>
              <Typography fontWeight={600} lineHeight={1.15}>
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
            <Box sx={notificationMenuHeaderIconSx({ alpha })}>
              {totalNotifications > 0 ? (
                <Badge badgeContent={totalNotifications} color="error">
                  <NotificationsOutlinedIcon fontSize="small" />
                </Badge>
              ) : (
                <NotificationsOutlinedIcon fontSize="small" />
              )}
            </Box>
          </Stack>
        </Box>
        <Divider />
        {totalNotifications === 0 ? (
          <Box sx={notificationEmptyStateSx}>
            <Typography fontWeight={600}>No notifications</Typography>
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
              sx={notificationMenuSelfTicketItemSx({ alpha })}
            >
              <Box sx={notificationMenuSelfTicketIconSx({ alpha })}>
                <FormatListBulletedOutlinedIcon fontSize="small" />
              </Box>
              <Box minWidth={0} sx={notificationItemTextSx}>
                <Typography fontWeight={600} lineHeight={1.15}>
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
              sx={notificationMenuTicketItemSx({ alpha })}
            >
              <Box sx={notificationMenuTicketIconSx({ alpha })}>
                <TaskAltOutlinedIcon fontSize="small" />
              </Box>
              <Box minWidth={0} sx={notificationItemTextSx}>
                <Typography fontWeight={600} lineHeight={1.15}>
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
        id="account-menu"
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: headerProfileMenuPaperSx,
          },
          list: {
            sx: headerMenuListSx,
            "aria-labelledby": "account-menu-button",
          },
        }}
      >
        <Box sx={appBarHeaderProfileBodySx}>
          <Box sx={appBarHeaderProfileCardSx({ alpha })}>
            <Box sx={appBarHeaderProfileHeaderSx}>
              <Avatar sx={headerAvatarSx}>
                {avatarInitials}
              </Avatar>
              <Stack spacing={0.5} sx={appBarHeaderProfileTextSx}>
                <Typography variant="subtitle1" fontWeight={600} sx={profileTruncatedTextSx}>
                  {loggedUser || "Signed in"}
                </Typography>
                {currentUser.username && (
                  <Typography variant="caption" color="text.secondary" sx={profileUsernameSx}>
                    @{currentUser.username}
                  </Typography>
                )}
                {currentUser.email && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={profileTruncatedTextSx}
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
                    color: "primary",
                  })}
                >
                  <AdminPanelSettingsOutlinedIcon fontSize="small" />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Role
                </Typography>
                <Box sx={appBarHeaderProfileValueSx}>
                  <Chip
                    label={role || "No roles assigned"}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <ProfileDetail icon={<BadgeOutlinedIcon fontSize="small" />} color="primary" label="Designation">
                <ProfileValue value={currentUser.designation} />
              </ProfileDetail>

              <ProfileDetail
                icon={<SupervisorAccountOutlinedIcon fontSize="small" />}
                color="primary"
                label="Reporting To"
              >
                <ProfileValue value={reportingTo || "Not assigned"} />
              </ProfileDetail>
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
                startIcon={<DescriptionOutlinedIcon />}
                onClick={downloadProcessFlow}
                sx={headerPhoneMenuButtonSx}
              >
                Process flow
              </Button>
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
                variant="outlined"
                color="error"
                startIcon={<LogoutOutlinedIcon />}
                onClick={logout}
                // sx={appBarHeaderProfileFooterButtonSx}
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
        <DialogHeader
          title="Change password"
          onClose={closeChangePasswordDialog}
          closeDisabled={changingPassword}
        />
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Current Password"
              type={showPasswords.old ? "text" : "password"}
              value={passwordForm.old_password}
              onChange={(event) =>
                updatePasswordForm("old_password", event.target.value)
              }
              fullWidth
              required
              autoComplete="current-password"
              error={Boolean(passwordErrors.old_password)}
              helperText={formatPasswordError(passwordErrors.old_password)}
              slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={showPasswords.old ? "Hide current password" : "Show current password"} onClick={() => setShowPasswords((value) => ({ ...value, old: !value.old }))} edge="end">{showPasswords.old ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment> } }}
            />
            <TextField
              label="New Password"
              type={showPasswords.next ? "text" : "password"}
              value={passwordForm.new_password}
              onChange={(event) =>
                updatePasswordForm("new_password", event.target.value)
              }
              fullWidth
              required
              autoComplete="new-password"
              error={Boolean(passwordErrors.new_password)}
              helperText={formatPasswordError(passwordErrors.new_password) || "Choose a new password that meets your organization's requirements."}
              slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={showPasswords.next ? "Hide new password" : "Show new password"} onClick={() => setShowPasswords((value) => ({ ...value, next: !value.next }))} edge="end">{showPasswords.next ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment> } }}
            />
            <TextField
              label="Confirm Password"
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordForm.confirm_password}
              onChange={(event) =>
                updatePasswordForm("confirm_password", event.target.value)
              }
              fullWidth
              required
              autoComplete="new-password"
              error={Boolean(passwordErrors.confirm_password) || Boolean(passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password)}
              helperText={formatPasswordError(passwordErrors.confirm_password) || (passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password ? "Passwords do not match." : "Re-enter your new password to confirm.")}
              slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={showPasswords.confirm ? "Hide confirmation password" : "Show confirmation password"} onClick={() => setShowPasswords((value) => ({ ...value, confirm: !value.confirm }))} edge="end">{showPasswords.confirm ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment> } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={submitChangePassword}
            disabled={changingPassword}
            startIcon={changingPassword ? undefined : <LockResetOutlinedIcon />}
          >
            {changingPassword ? "Changing..." : "Change password"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
