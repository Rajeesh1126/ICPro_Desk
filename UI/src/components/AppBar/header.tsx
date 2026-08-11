import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { alpha } from "@mui/material/styles";
import logo from "../../assets/icpro_logo.svg";
import pdfFile from "../../assets/Work_Wise_Process_Flow.pdf";
import api from "../../api/axios";
import { useThemeMode } from "../../styles/theme/themeModeContext";
import { appBarHeaderAvatarSx1, appBarHeaderBoxSx1, appBarHeaderBoxSx2, appBarHeaderBoxSx3, appBarHeaderBoxSx4, appBarHeaderCallbackCallbackSx1, appBarHeaderCallbackCallbackSx2, appBarHeaderCallbackCallbackSx3, appBarHeaderCallbackCallbackSx4, appBarHeaderCallbackCallbackSx5, appBarHeaderCallbackCallbackSx6, appBarHeaderCallbackCallbackSx8, appBarHeaderCallbackCallbackSx9, appBarHeaderContainerSx1, appBarHeaderDrawerSx1, appBarHeaderDynamicDynamicAppBarSx1, appBarHeaderDynamicDynamicAvatarSx1, appBarHeaderDynamicDynamicListItemIconSx1, appBarHeaderIconButtonSx1, appBarHeaderIconButtonSx2, appBarHeaderStackSx1, appBarHeaderStackSx3, appBarHeaderToolbarSx1, appBarHeaderTypographySx3, appBarHeaderTypographySx4, marginTopMediumSx, marginTopSmallSx, navButtonSx, navListItemSx, pushRightSx } from "../../styles/common";
import type { NotificationsType } from "../../types/TicketData";

const pages = [
  { label: "Do List", path: "/SelfTickets", icon: <FormatListBulletedRoundedIcon />, codeName: "view_self_tickets" },
  { label: "Tickets", path: "/Tickets", icon: <TaskAltRoundedIcon />, codeName: "view_ticket" },
  { label: "Team Analysis", path: "/Dashboard", icon: <GridViewRoundedIcon />, codeName: "view_managementoverview" },
  { label: "Executive Overview", path: "/Reports", icon: <SummarizeRoundedIcon />, codeName: "view_report" },
] as const;

const EMPTY_NOTIFICATIONS: NotificationsType = {
  selfticketOpenCount: 0,
  ticketOpenCount: 0,
};


function getStoredPermissions(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("permissionList") ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

const loggedUser = localStorage.getItem("first_name");

export default function ResponsiveAppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode } = useThemeMode();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [permissions, setPermissions] = useState<string[]>(getStoredPermissions);
  const [notifications, setNotifications] =
    useState<NotificationsType>(EMPTY_NOTIFICATIONS);

  // useEffect(() => {
  //   let active = true;
  //   void api
  //     .get("/users/getHeaderData/")
  //     .then((response) => {
        
  //       if (!active) return;
  //       const topNavData: unknown = response.data.topNavData;
  //       const nextPermissions = Array.isArray(topNavData)
  //         ? topNavData.filter((item): item is string => typeof item === "string")
  //         : [];
  //       setPermissions(nextPermissions);
  //       localStorage.setItem("permissionList", JSON.stringify(nextPermissions));
  //     })
  //     .catch(() => undefined);
  //   return () => {
  //     active = false;
  //   };
  // }, []);

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

  const visiblePages = useMemo(
    () => pages.filter((page) => permissions.includes(page.codeName)),
    [permissions]
  );
  const totalNotifications = notifications.selfticketOpenCount + notifications.ticketOpenCount;

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

  const navItems = visiblePages.map((page) => {
    const selected = location.pathname === page.path || location.pathname.startsWith(`${page.path}/`);
    return (
      <ListItemButton
        key={page.path}
        component={RouterLink}
        to={page.path}
        selected={selected}
        onClick={() => setDrawerOpen(false)}
        sx={navListItemSx(selected)}
      >
        <ListItemIcon sx={appBarHeaderDynamicDynamicListItemIconSx1({ selected })}>
          {page.icon}
        </ListItemIcon>
        <ListItemText primary={page.label} primaryTypographyProps={{ fontWeight: selected ? 800 : 650 }} />
      </ListItemButton>
    );
  });

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={appBarHeaderDynamicDynamicAppBarSx1({  })}
    >
      <Container maxWidth={false} sx={appBarHeaderContainerSx1}>
        <Toolbar disableGutters sx={appBarHeaderToolbarSx1}>

          <Box component={RouterLink} to="/SelfTickets" sx={appBarHeaderBoxSx1}>
            <Box component="img" src={logo} alt="ICPro" sx={appBarHeaderBoxSx2} />
          </Box>

          <IconButton aria-label="Open navigation" onClick={() => setDrawerOpen(true)} sx={appBarHeaderIconButtonSx1}>
            <MenuIcon />
          </IconButton>

          <Stack direction="row" spacing={0.5} sx={appBarHeaderStackSx1}>
            {visiblePages.map((page) => {
              const selected = location.pathname === page.path || location.pathname.startsWith(`${page.path}/`);
              return (
                <Button
                  key={page.path}
                  component={RouterLink}
                  to={page.path}
                  startIcon={page.icon}
                  color={selected ? "primary" : "inherit"}
                  sx={navButtonSx(selected)}
                >
                  {page.label}
                </Button>
              );
            })}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={{ xs: 0, sm: 0.5 }} sx={pushRightSx}>
            <Tooltip title="Process flow">
              <IconButton aria-label="Download process flow" onClick={downloadProcessFlow}>
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton
                aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                onClick={toggleMode}
              >
                {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={totalNotifications ? `${totalNotifications} action items` : "No notifications"}>
              <IconButton aria-label="Notifications" onClick={(event) => setNotificationAnchor(event.currentTarget)}>
                <Badge badgeContent={totalNotifications} color="error">
                  <NotificationsOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Account">
              <IconButton aria-label="Account menu" onClick={(event) => setProfileAnchor(event.currentTarget)} sx={appBarHeaderIconButtonSx2}>
                <Avatar sx={appBarHeaderAvatarSx1}>
                  {loggedUser?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </Container>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={appBarHeaderDrawerSx1}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={appBarHeaderStackSx3}>
          <Typography variant="h6">Navigation</Typography>
          <IconButton aria-label="Close navigation" onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
        </Stack>
        <List disablePadding>{navItems}</List>
      </Drawer>

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
        <Box
          sx={appBarHeaderCallbackCallbackSx1({ alpha })}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Box minWidth={0}>
              <Typography fontWeight={900} lineHeight={1.15}>
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={marginTopSmallSx}>
                {totalNotifications ? `${totalNotifications} action item${totalNotifications === 1 ? "" : "s"} need attention` : "You are all caught up"}
              </Typography>
            </Box>
            <Box
              sx={appBarHeaderCallbackCallbackSx2({ alpha })}
            >
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
            <Typography variant="body2" color="text.secondary" sx={marginTopMediumSx}>
              New ticket updates will appear here.
            </Typography>
          </Box>
        ) : [
            <MenuItem
              key="self-tickets"
              component={RouterLink}
              to="/SelfTickets"
              onClick={() => setNotificationAnchor(null)}
              sx={appBarHeaderCallbackCallbackSx3({ alpha })}
            >
              <Box
                sx={appBarHeaderCallbackCallbackSx4({ alpha })}
              >
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
              <Badge badgeContent={notifications.selfticketOpenCount} color="primary" />
            </MenuItem>,
            <MenuItem
              key="tickets"
              component={RouterLink}
              to="/Tickets"
              onClick={() => setNotificationAnchor(null)}
              sx={appBarHeaderCallbackCallbackSx5({ alpha })}
            >
              <Box
                sx={appBarHeaderCallbackCallbackSx6({ alpha })}
              >
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
              <Badge badgeContent={notifications.ticketOpenCount} color="primary" />
            </MenuItem>,
        ]}
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
              width: 286,
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
          list: {
            sx: { p: 0 },
          },
        }}
      >
        <Box
          sx={appBarHeaderCallbackCallbackSx1({ alpha })}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={appBarHeaderDynamicDynamicAvatarSx1({ alpha })}
            >
              {loggedUser?.charAt(0).toUpperCase()}
            </Avatar>
            <Box minWidth={0}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={appBarHeaderTypographySx3}
              >
                Signed in
              </Typography>
              <Typography
                fontWeight={900}
                sx={appBarHeaderTypographySx4}
              >
                {loggedUser}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Divider />
        <MenuItem
          onClick={logout}
          sx={appBarHeaderCallbackCallbackSx8({ alpha })}
        >
          <Box
            sx={appBarHeaderCallbackCallbackSx9({ alpha })}
          >
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
