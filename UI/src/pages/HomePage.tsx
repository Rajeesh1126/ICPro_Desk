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
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EventNoteIcon from "@mui/icons-material/EventNote";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import RateReviewIcon from "@mui/icons-material/RateReview";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import SchemaIcon from "@mui/icons-material/Schema";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import Header from "../components/appBar/Header";
import {
  appMain,
  appShell,
  appShellBody,
  listItemReset,
  mobileDrawer,
  sidebarContent,
  sidebarIcon,
  sidebarItem,
  sidebarItemText,
  sidebarNav,
  sidebarPanel,
  sidebarSection,
  sidebarSectionDivider,
} from "../styles/common";

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
    icon: <DashboardOutlinedIcon />,
    activeIcon: <DashboardIcon />,
    iconColor: "#2563eb",
  },
  {
    label: "Do List",
    section: "Tickets",
    path: "/Home/SelfTickets",
    icon: <AssignmentTurnedInOutlinedIcon />,
    activeIcon: <AssignmentTurnedInIcon />,
    iconColor: "#0891b2",
    codeName: "access_self_tickets",
  },
  {
    label: "Tickets",
    section: "Tickets",
    path: "/Home/Tickets",
    icon: <SupportAgentOutlinedIcon />,
    activeIcon: <SupportAgentIcon />,
    iconColor: "#16a34a",
    codeName: "access_tickets",
  },
  {
    label: "Work Let",
    section: "Tickets",
    path: "/Home/InternalTickets",
    icon: <WorkHistoryOutlinedIcon />,
    activeIcon: <WorkHistoryIcon />,
    iconColor: "#0f766e",
    codeName: "access_tickets",
  },
  {
    label: "Timesheet",
    section: "Timesheet",
    path: "/Home/TimeSheet",
    icon: <CalendarMonthOutlinedIcon />,
    activeIcon: <CalendarMonthIcon />,
    iconColor: "#dc2626",
    codeName: "access_timesheet",
  },
  {
    label: "Executive Overview",
    section: "Analysis",
    path: "/Home/Reports",
    icon: <InsightsOutlinedIcon />,
    activeIcon: <InsightsIcon />,
    iconColor: "#ea580c",
    codeName: "access_executive_overview",
  },
  {
    label: "Team Analysis",
    section: "Analysis",
    path: "/Home/Dashboard",
    icon: <GroupsOutlinedIcon />,
    activeIcon: <GroupsIcon />,
    iconColor: "#7c3aed",
    codeName: "access_team_analysis",
  },
  {
    label: "Timesheet Logs",
    section: "Analysis",
    path: "/Home/TimesheetLogs",
    icon: <EventNoteOutlinedIcon />,
    activeIcon: <EventNoteIcon />,
    iconColor: "#9333ea",
    codeName: "access_timesheet_log",
  },
  {
    label: "Timesheet Analysis",
    section: "Analysis",
    path: "/Home/TimesheetAnalysis",
    icon: <QueryStatsOutlinedIcon />,
    activeIcon: <QueryStatsIcon />,
    iconColor: "#0284c7",
    codeName: "access_timesheet",
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
    icon: <AdminPanelSettingsOutlinedIcon />,
    activeIcon: <AdminPanelSettingsIcon />,
    iconColor: "#4f46e5",
    codeName: "access_role_management",
  },
  {
    label: "Project Configuration",
    section: "Configuration",
    path: "/Home/ProjectConfiguration",
    icon: <SchemaOutlinedIcon />,
    activeIcon: <SchemaIcon />,
    iconColor: "#00695c",
    codeName: "access_project_configuration",
  },
  {
    label: "Phase Configuration",
    section: "Configuration",
    path: "/Home/PhaseConfiguration",
    icon: <TuneOutlinedIcon />,
    activeIcon: <TuneIcon />,
    iconColor: "#64748b",
    codeName: "access_phase_configuration",
  },
  {
    label: "Document Templates",
    section: "General",
    path: "/Home/Documents",
    icon: <ArticleOutlinedIcon />,
    activeIcon: <ArticleIcon />,
    iconColor: "#475569",
    codeName: "access_document_template",
  },
  {
    label: "Suggestion / Feedback",
    section: "General",
    path: "/Home/Suggestions",
    icon: <RateReviewOutlinedIcon />,
    activeIcon: <RateReviewIcon />,
    iconColor: "#059669",
    codeName: "access_system_suggetions",
  },
  {
    label: "Lesson Learnt",
    section: "General",
    path: "/Home/LessonLearnt",
    icon: <LightbulbOutlinedIcon />,
    activeIcon: <LightbulbIcon />,
    iconColor: "#ca8a04",
    codeName: "access_lesson_learnt",
  }
] as const;

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

  const sidebar = (
    <Box sx={sidebarContent}>
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
            <Box key={page.path} component="li" sx={listItemReset}>
              {showSectionHeader && (
                <Box sx={{ position: "relative" }}>
                  <Typography
                    component="div"
                    className="sidebar-section-label"
                    sx={sidebarSection(sidebarSectionHeight)}
                  >
                    {page.section}
                  </Typography>
                  <Divider
                    className="sidebar-section-divider"
                    sx={sidebarSectionDivider()}
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
                sx={sidebarItem(selected, page.iconColor)}
              >
                <ListItemIcon sx={sidebarIcon(selected, page.iconColor)}>
                  {selected ? page.activeIcon : page.icon}
                </ListItemIcon>
                <ListItemText
                  primary={page.label}
                  sx={sidebarItemText(selected)}
                />
              </ListItemButton>
            </Box>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={appShell}>
      <Header
        onMenuClick={() => {
          if (isSidebarLayout) {
            setDesktopSidebarOpen((open) => !open);
          } else {
            setMobileSidebarOpen((open) => !open);
          }
        }}
      />
      <Box sx={appShellBody}>
        <Box
          component="nav"
          sx={sidebarNav(desktopSidebarOpen, sidebarWidth, sidebarCollapsedWidth)}
          aria-label="Primary navigation"
        >
          <Box
            sx={sidebarPanel(
              desktopSidebarOpen,
              sidebarWidth,
              sidebarCollapsedWidth,
              sidebarSectionHeight,
            )}
          >
            {sidebar}
          </Box>
        </Box>
        <Drawer
          variant="temporary"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={mobileDrawer}
        >
          {sidebar}
        </Drawer>
        <Box component="main" sx={appMain}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
