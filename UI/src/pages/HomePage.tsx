import { useMemo, useState, type ReactNode } from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import BadgeIcon from "@mui/icons-material/Badge";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import RuleFolderIcon from "@mui/icons-material/RuleFolder";
import RuleFolderOutlinedIcon from "@mui/icons-material/RuleFolderOutlined";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CategoryIcon from "@mui/icons-material/Category";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FeedbackIcon from "@mui/icons-material/Feedback";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";
import PsychologyAltOutlinedIcon from "@mui/icons-material/PsychologyAltOutlined";
import Header from "../components/appBar/Header";

const sidebarWidth = 265;
const sidebarCollapsedWidth = 64;
const sidebarSectionHeight = 22;

type SidebarPage = {
  label: string;
  path: string;
  icon: ReactNode;
  activeIcon: ReactNode;
  iconColor: `#${string}`;
  section?: string;
  codeName?: string;
};

const pages: readonly SidebarPage[] = [
  {
    label: "Home",
    path: "/Home",
    icon: <HomeOutlinedIcon />,
    activeIcon: <HomeIcon />,
    iconColor: "#1976d2",
  },
  {
    label: "Do List",
    section: "Tickets",
    path: "/Home/SelfTickets",
    icon: <FormatListBulletedOutlinedIcon />,
    activeIcon: <FormatListBulletedIcon />,
    iconColor: "#0288d1",
    codeName: "access_self_tickets",
  },
  {
    label: "Tickets",
    section: "Tickets",
    path: "/Home/Tickets",
    icon: <ConfirmationNumberOutlinedIcon />,
    activeIcon: <ConfirmationNumberIcon />,
    iconColor: "#2e7d32",
    codeName: "access_tickets",
  },
  {
    label: "Timesheet",
    section: "Timesheet",
    path: "/Home/TimeSheet",
    icon: <FactCheckOutlinedIcon />,
    activeIcon: <FactCheckIcon />,
    iconColor: "#d32f2f",
    codeName: "access_timesheet",
  },
  {
    label: "Timesheet Logs",
    section: "Timesheet",
    path: "/Home/TimesheetLogs",
    icon: <RuleFolderOutlinedIcon />,
    activeIcon: <RuleFolderIcon />,
    iconColor: "#7b1fa2",
    codeName: "access_timesheet_log",
  },
  {
    label: "Documents",
    section: "General",
    path: "/Home/Documents",
    icon: <DescriptionOutlinedIcon />,
    activeIcon: <DescriptionIcon />,
    iconColor: "#455a64",
    codeName: "access_document_template",
  },
  {
    label: "Feedback",
    section: "General",
    path: "/Home/Suggestions",
    icon: <FeedbackOutlinedIcon />,
    activeIcon: <FeedbackIcon />,
    iconColor: "#00897b",
    codeName: "access_system_suggetions",
  },
  {
    label: "Lesson Learnt",
    section: "General",
    path: "/Home/LessonLearnt",
    icon: <PsychologyAltOutlinedIcon />,
    activeIcon: <PsychologyAltIcon />,
    iconColor: "#6d4c41",
     codeName: "access_lesson_learnt",
  },

  {
    label: "Executive Overview",
    section: "Analysis",
    path: "/Home/Reports",
    icon: <AssessmentOutlinedIcon />,
    activeIcon: <AssessmentIcon />,
    iconColor: "#ed6c02",
    codeName: "access_executive_overview",
  },
  {
    label: "Team Analysis",
    section: "Analysis",
    path: "/Home/Dashboard",
    icon: <AnalyticsOutlinedIcon />,
    activeIcon: <AnalyticsIcon />,
    iconColor: "#9c27b0",
    codeName: "access_team_analysis",
  },
  {
    label: "Users Managment",
    section: "User Management",
    path: "/Home/Users",
    icon: <ManageAccountsOutlinedIcon />,
    activeIcon: <ManageAccountsIcon />,
    iconColor: "#00838f",
    codeName: "access_user_management",
  },
  {
    label: "Roles Managment",
    section: "User Management",
    path: "/Home/Roles",
    icon: <BadgeOutlinedIcon />,
    activeIcon: <BadgeIcon />,
    iconColor: "#3949ab",
    codeName: "access_role_management",
  },
  {
    label: "Project Configuration",
    section: "Configuration",
    path: "/Home/ProjectConfiguration",
    icon: <AccountTreeOutlinedIcon />,
    activeIcon: <AccountTreeIcon />,
    iconColor: "#00695c",
    codeName: "access_project_configuration",
  },
  {
    label: "Phase Configuration",
    section: "Configuration",
    path: "/Home/PhaseConfiguration",
    icon: <CategoryOutlinedIcon />,
    activeIcon: <CategoryIcon />,
    iconColor: "#5d4037",
    codeName: "access_phase_configuration",
  },
] as const;

const sidebarItemSx =
  (selected: boolean, iconColor: `#${string}`) => (theme: Theme) => {
    return {
      borderRadius: 0.75,
      mb: 0.5,
      // minHeight: 38,
      overflow: "hidden",
      px: 0,
      py: 0.25,
      transition: theme.transitions.create(
        ["background-color", "color", "box-shadow"],
        {
          duration: theme.transitions.duration.shorter,
        },
      ),
      ...(selected && {
        backgroundColor: alpha(
          iconColor,
          theme.palette.mode === "dark" ? 0.18 : 0.1,
        ),
        boxShadow: `inset 4px 0 0 ${iconColor}`,
      }),
      "&:hover": {
        backgroundColor: alpha(
          iconColor,
          theme.palette.mode === "dark" ? 0.14 : 0.08,
        ),
      },
    };
  };

const sidebarIconSx = (selected: boolean, iconColor: `#${string}`) => () => ({
  minWidth: 48,
  justifyContent: "center",
  color: selected ? iconColor : alpha(iconColor, 0.78),
});

const sidebarSectionSx = (theme: Theme) => ({
  alignItems: "center",
  display: "flex",
  height: sidebarSectionHeight,
  px: 0.5,
  py: 0,
  color: "text.secondary",
  fontSize: "0.6875rem",
  fontWeight: 600,
  letterSpacing: 0,
  lineHeight: 1,
  textTransform: "uppercase",
  transition: theme.transitions.create(["opacity", "transform"], {
    duration: theme.transitions.duration.shorter,
  }),
});

const sidebarSectionDividerSx = {
  display: "none",
  height: sidebarSectionHeight,
  mx: "auto",
  my: 0,
  width: 28,
  borderColor: "divider",
};

function getStoredPermissions(): string[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("permissions") ?? "[]",
    );
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export default function HomePage() {
  const location = useLocation();
  const isSidebarLayout = useMediaQuery("(min-width:600px)");
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [permissions] = useState<string[]>(getStoredPermissions);

  const visiblePages = useMemo(
    () =>
      pages.filter(
        (page) => !page.codeName || permissions.includes(page.codeName),
      ),
    [permissions],
  );

  const sidebarContent = (
    <Box sx={{ p: 1 }}>
      <List disablePadding>
        {visiblePages.map((page, index) => {
          const selected =
            page.path === "/Home"
              ? location.pathname === page.path
              : location.pathname === page.path ||
              location.pathname.startsWith(`${page.path}/`);
          const showSectionHeader =
            page.section && page.section !== visiblePages[index - 1]?.section;
          return (
            <Box key={page.path} component="li" sx={{ listStyle: "none" }}>
              {showSectionHeader && (
                <Box>
                  <Typography
                    component="div"
                    className="sidebar-section-label"
                    sx={sidebarSectionSx}
                  >
                    {page.section}
                  </Typography>
                  <Divider
                    className="sidebar-section-divider"
                    sx={sidebarSectionDividerSx}
                  />
                </Box>
              )}
              <ListItemButton
                component={RouterLink}
                to={page.path}
                selected={selected}
                onClick={() => {
                  if (!isSidebarLayout) setMobileSidebarOpen(false);
                }}
                sx={sidebarItemSx(selected, page.iconColor)}
              >
                <ListItemIcon sx={sidebarIconSx(selected, page.iconColor)}>
                  {selected ? page.activeIcon : page.icon}
                </ListItemIcon>
                <ListItemText
                  primary={page.label}
                  sx={{
                    "& .MuiTypography-root": {
                      fontSize: "0.875rem",
                      fontWeight: selected ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </Box>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        height: "100dvh",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Header
        onMenuClick={() => {
          if (isSidebarLayout) {
            setDesktopSidebarOpen((open) => !open);
          } else {
            setMobileSidebarOpen((open) => !open);
          }
        }}
      />
      <Box
        sx={{
          display: "flex",
          height: { xs: "calc(100dvh - 58px)", sm: "calc(100dvh - 64px)" },
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Box
          component="nav"
          sx={(theme) => ({
            display: { xs: "none", sm: "block" },
            width: desktopSidebarOpen ? sidebarWidth : sidebarCollapsedWidth,
            flexShrink: 0,
            overflow: "visible",
            position: "relative",
            transition: theme.transitions.create(["width"], {
              duration: theme.transitions.duration.shorter,
            }),
          })}
          aria-label="Primary navigation"
        >
          <Box
            sx={(theme) => ({
              width: desktopSidebarOpen ? sidebarWidth : sidebarCollapsedWidth,
              height: "100%",
              overflow: "hidden",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: theme.transitions.create(["width", "box-shadow"], {
                duration: theme.transitions.duration.shorter,
              }),
              ...(!desktopSidebarOpen && {
                position: "absolute",
                inset: 0,
                right: "auto",
                zIndex: theme.zIndex.drawer,
                "& .MuiListItemButton-root": {
                  justifyContent: "center",
                  mx: 0,
                  px: 0,
                  width: "100%",
                },
                "& .MuiListItemIcon-root": {
                  minWidth: 48,
                  p: 0,
                },
                "& .MuiListItemText-root": {
                  opacity: 0,
                  transform: "translateX(-10px)",
                  p: 0,
                  whiteSpace: "nowrap",
                  transition: theme.transitions.create(
                    ["opacity", "transform"],
                    {
                      duration: theme.transitions.duration.shorter,
                    },
                  ),
                  transitionDelay: "0ms",
                },
                "& .sidebar-section-label": {
                  height: 0,
                  opacity: 0,
                  overflow: "hidden",
                  p: 0,
                  transform: "translateX(-10px)",
                },
                "& .sidebar-section-divider": {
                  display: "block",
                },
                "&:hover": {
                  width: sidebarWidth,
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "14px 0 34px rgba(0, 0, 0, 0.34)"
                      : "14px 0 34px rgba(15, 23, 42, 0.16)",
                },
                "&:hover .MuiListItemButton-root": {
                  justifyContent: "flex-start",
                },
                "&:hover .MuiListItemText-root": {
                  opacity: 1,
                  transform: "translateX(0)",
                  transitionDelay: "90ms",
                },
                "&:hover .sidebar-section-label": {
                  alignItems: "center",
                  display: "flex",
                  height: sidebarSectionHeight,
                  opacity: 1,
                  overflow: "visible",
                  px: 0.5,
                  py: 0,
                  transform: "translateX(0)",
                  transitionDelay: "90ms",
                },
                "&:hover .sidebar-section-divider": {
                  display: "none",
                },
              }),
            })}
          >
            {sidebarContent}
          </Box>
        </Box>
        <Drawer
          variant="temporary"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: "min(86vw, 320px)",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            height: "100%",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
