import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { alpha, type Theme } from "@mui/material/styles";
import logo from "../../assets/icpro_logo.svg";
import pdfFile from "../../assets/Work_Wise_Process_Flow.pdf";
import api from "../../api/axios";
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
  appBarHeaderToolbarSx1,
  appBarHeaderTypographySx3,
  appBarHeaderTypographySx4,
  marginTopMediumSx,
  marginTopSmallSx,
  pushRightSx,
} from "../../styles/common";
import type { NotificationsType } from "../../types/dataTypes";

const EMPTY_NOTIFICATIONS: NotificationsType = {
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

const logoutMenuItemSx = (theme: Theme) => ({
  m: 1.25,
  px: 1.5,
  py: 1.25,
  gap: 1.25,
  borderRadius: 1.5,
  color: "error.main",
  bgcolor: alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.16 : 0.1),
  border: "1px solid",
  borderColor: alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.28 : 0.2),
  boxShadow:
    theme.palette.mode === "dark"
      ? `0 10px 24px ${alpha(theme.palette.error.main, 0.12)}`
      : `0 10px 24px ${alpha(theme.palette.error.main, 0.1)}`,
  "&:hover": {
    bgcolor: alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.24 : 0.16),
    borderColor: alpha(theme.palette.error.main, 0.38),
  },
});

const logoutIconWrapSx = (theme: Theme) => ({
  width: 38,
  height: 38,
  borderRadius: 0.8,
  display: "grid",
  placeItems: "center",
  bgcolor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  flexShrink: 0,
});

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
      localStorage.getItem("user") ?? "{}",
    );
    return typeof value === "object" && value !== null
      ? (value as StoredUser)
      : {};
  } catch {
    return {};
  }
}
const loggedUser = localStorage.getItem("first_name");

type ResponsiveAppBarProps = {
  onMenuClick?: () => void;
};

export default function ResponsiveAppBar({
  onMenuClick,
}: ResponsiveAppBarProps) {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const [notificationAnchor, setNotificationAnchor] =
    useState<HTMLElement | null>(null);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] =
    useState<NotificationsType>(EMPTY_NOTIFICATIONS);

  // useEffect(() => {
  //   let active = true;
  //   void api
  //     .get("/notifications/")
  //     .then((response) => {
  //       if (!active) return;
  //       setNotifications(response.data ?? EMPTY_NOTIFICATIONS);
  //     })
  //     .catch(() => undefined);
  //   return () => {
  //     active = false;
  //   };
  // }, []);

  const currentUser = getStoredUser();
  // const currentUserName = currentUser.full_name || currentUser.username || "User";
  const userGroups = Array.isArray(currentUser.groups) ? currentUser.groups : [];
  const userRoles = Array.isArray(currentUser.role) ? currentUser.role : [];

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
            sx={(theme) => ({
              ...(appBarHeaderIconButtonSx1 as object),
              ...coloredIconButtonSx("primary")(theme),
              alignSelf: "center",
              alignItems: "flex-end",
              p: 0,
              width: 32,
              height: 40,
              justifyContent: "center",
              "&:hover": {
                bgcolor: "transparent",
              },
            })}
          >
            <MenuIcon />
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
                  <LightModeRoundedIcon />
                ) : (
                  <DarkModeRoundedIcon />
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
                sx={{ ...appBarHeaderIconButtonSx2, "&&": { ml: 2 } }}
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
            sx: (theme) => ({
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
            }),
          },
          list: { sx: { p: 0 } },
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
                <FormatListBulletedRoundedIcon fontSize="small" />
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
                <TaskAltRoundedIcon fontSize="small" />
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
            sx: (theme) => ({
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
            }),
          },
          list: {
            sx: { p: 0 },
          },
        }}
      >
        <Box sx={appBarHeaderCallbackCallbackSx1({ alpha })}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={appBarHeaderDynamicDynamicAvatarSx1({ alpha })}>
              {loggedUser?.charAt(0).toUpperCase()}
            </Avatar>
            <Stack spacing={0.5}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={appBarHeaderTypographySx3}
              >
                {currentUser.username}
              </Typography>
              <Typography fontWeight={700} sx={appBarHeaderTypographySx4}>
                {loggedUser?.toUpperCase()}
              </Typography>
              {currentUser.email && (
                <Typography variant="body2" color="text.secondary" sx={appBarHeaderTypographySx4}>
                  {currentUser.email}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: "min(58dvh, 520px)", overflowY: "auto", p: 2 }}>
          <Stack spacing={1.5}>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={900}>
                Groups
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.75 }}>
                {userGroups.length ? (
                  userGroups.map((group) => (
                    <Chip key={group} label={group} size="small" color="info" variant="outlined" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No groups assigned
                  </Typography>
                )}
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={900}>
                Roles
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.75 }}>
                {userRoles.length ? (
                  userRoles.map((role) => (
                    <Chip
                      key={role.id ?? role.name}
                      label={role.name || `Role ${role.id}`}
                      size="small"
                      color="secondary"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No roles assigned
                  </Typography>
                )}
              </Stack>
            </Box>

          </Stack>
        </Box>
        <Divider />
        <MenuItem
          onClick={logout}
          sx={logoutMenuItemSx}
        >
          <Box sx={logoutIconWrapSx}>
            <LogoutRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography fontWeight={900} lineHeight={1.15}>
              Logout
            </Typography>
            <Typography variant="caption" color="text.secondary">
              End current session
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
