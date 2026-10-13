import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
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
import { preloadRoute } from "../routes/lazyPages";
import { useSessionExpiryWatch } from "../api/session";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { prefetchTeamSummary } from "./tickets/teamSummaryQuery";
import { prefetchApi } from "../api/useApiQuery";
import ErrorBoundary from "../components/common/ErrorBoundary";
import ErrorPage from "./ErrorPage";
import PageLoadingSkeleton from "../components/common/PageLoadingSkeleton";
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
  section?: string;
  codeName?: string;
};

const pages: readonly SidebarPage[] = [
  {
    label: "Home",
    path: "/Home",
    icon: <DashboardOutlinedIcon />,
    activeIcon: <DashboardIcon />,
  },
  {
    label: "Do List",
    section: "Tickets",
    path: "/Home/SelfTickets",
    icon: <AssignmentTurnedInOutlinedIcon />,
    activeIcon: <AssignmentTurnedInIcon />,
    codeName: "access_self_tickets",
  },
  {
    label: "Tickets",
    section: "Tickets",
    path: "/Home/Tickets",
    icon: <SupportAgentOutlinedIcon />,
    activeIcon: <SupportAgentIcon />,
    codeName: "access_tickets",
  },
  {
    label: "Work Let",
    section: "Tickets",
    path: "/Home/InternalTickets",
    icon: <WorkHistoryOutlinedIcon />,
    activeIcon: <WorkHistoryIcon />,
    codeName: "access_tickets",
  },
  {
    label: "Timesheet",
    section: "Timesheet",
    path: "/Home/TimeSheet",
    icon: <CalendarMonthOutlinedIcon />,
    activeIcon: <CalendarMonthIcon />,
    codeName: "access_timesheet",
  },
  {
    label: "Executive Overview",
    section: "Analysis",
    path: "/Home/Reports",
    icon: <InsightsOutlinedIcon />,
    activeIcon: <InsightsIcon />,
    codeName: "access_executive_overview",
  },
  {
    label: "Team Analysis",
    section: "Analysis",
    path: "/Home/Dashboard",
    icon: <GroupsOutlinedIcon />,
    activeIcon: <GroupsIcon />,
    codeName: "access_team_analysis",
  },
  {
    label: "Timesheet Logs",
    section: "Analysis",
    path: "/Home/TimesheetLogs",
    icon: <EventNoteOutlinedIcon />,
    activeIcon: <EventNoteIcon />,
    codeName: "access_timesheet_log",
  },
  {
    label: "Timesheet Analysis",
    section: "Analysis",
    path: "/Home/TimesheetAnalysis",
    icon: <QueryStatsOutlinedIcon />,
    activeIcon: <QueryStatsIcon />,
    codeName: "access_timesheet_log",
  },
  {
    label: "Users Management",
    section: "User Management",
    path: "/Home/Users",
    icon: <ManageAccountsOutlinedIcon />,
    activeIcon: <ManageAccountsIcon />,
    codeName: "access_user_management",
  },
  {
    label: "Roles Management",
    section: "User Management",
    path: "/Home/Roles",
    icon: <AdminPanelSettingsOutlinedIcon />,
    activeIcon: <AdminPanelSettingsIcon />,
    codeName: "access_role_management",
  },
  {
    label: "Project Configuration",
    section: "Configuration",
    path: "/Home/ProjectConfiguration",
    icon: <SchemaOutlinedIcon />,
    activeIcon: <SchemaIcon />,
    codeName: "access_project_configuration",
  },
  {
    label: "Phase Configuration",
    section: "Configuration",
    path: "/Home/PhaseConfiguration",
    icon: <TuneOutlinedIcon />,
    activeIcon: <TuneIcon />,
    codeName: "access_phase_configuration",
  },
  {
    label: "Document Templates",
    section: "General",
    path: "/Home/Documents",
    icon: <ArticleOutlinedIcon />,
    activeIcon: <ArticleIcon />,
    codeName: "access_document_template",
  },
  {
    label: "Suggestion / Feedback",
    section: "General",
    path: "/Home/Suggestions",
    icon: <RateReviewOutlinedIcon />,
    activeIcon: <RateReviewIcon />,
    codeName: "access_system_suggetions",
  },
  {
    label: "Lesson Learnt",
    section: "General",
    path: "/Home/LessonLearnt",
    icon: <LightbulbOutlinedIcon />,
    activeIcon: <LightbulbIcon />,
    codeName: "access_lesson_learnt",
  },
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

/** Preload a page's code and, for the busiest dashboard, its default data. */
function warmRoute(path: string) {
  preloadRoute(path);
  if (path === "/Home") {
    void prefetchApi("/erp/quotations/budget-summary/");
  } else if (path === "/Home/Dashboard") {
    void prefetchTeamSummary();
  } else if (path === "/Home/PhaseConfiguration") {
    void prefetchApi("/erp/cost-categories/");
    void prefetchApi("/phases/");
  } else if (path === "/Home/TimeSheet") {
    const today = new Date();
    const monday = new Date(today);
    const day = today.getDay();
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    const weekStart = [
      monday.getFullYear(),
      String(monday.getMonth() + 1).padStart(2, "0"),
      String(monday.getDate()).padStart(2, "0"),
    ].join("-");
    void prefetchApi("/timesheet-entries/", { week_start: weekStart });
    void prefetchApi("/timesheet-week-logs/current/", { week_start: weekStart });
    void prefetchApi("/users/");
  }
}

export default function HomePage() {
  useSessionExpiryWatch();
  const location = useLocation();
  const isSidebarLayout = useMediaQuery((theme) => theme.breakpoints.up("md"));
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

  // Browser-tab title follows the sidebar label ("Tickets · ICProDesk").
  const currentPageLabel =
    pages.find((page) => page.path === location.pathname)?.label ??
    (location.pathname.startsWith("/error") ? "Error" : "Page not found");
  useDocumentTitle(currentPageLabel);

  // Warm the code for frequent destinations once the browser is idle.
  useEffect(() => {
    const frequent = [
      "/Home/Dashboard",
      "/Home/Tickets",
      "/Home/SelfTickets",
      "/Home/TimeSheet",
    ].filter((path) => visiblePages.some((page) => page.path === path));
    const run = () => frequent.forEach(preloadRoute);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = globalThis.setTimeout(run, 2000);
    return () => globalThis.clearTimeout(id);
  }, [visiblePages]);

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
                onMouseEnter={() => warmRoute(page.path)}
                onFocus={() => warmRoute(page.path)}
                onTouchStart={() => warmRoute(page.path)}
                onClick={() => {
                  if (!isSidebarLayout) setMobileSidebarOpen(false);
                }}
                sx={sidebarItem(selected)}
              >
                <ListItemIcon sx={sidebarIcon(selected)}>
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
      {/* First tab stop: jump past the header and sidebar to the page. */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: (theme) => theme.zIndex.tooltip + 1,
          px: 1.5,
          py: 1,
          borderRadius: 1,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontWeight: 700,
          textDecoration: "none",
          transition: "top 120ms ease",
          "&:focus": { top: 8 },
        }}
      >
        Skip to main content
      </Box>
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
          sx={sidebarNav(
            desktopSidebarOpen,
            sidebarWidth,
            sidebarCollapsedWidth,
          )}
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
          <Box
            sx={{
              display: "flex",
              minHeight: 52,
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography fontWeight={700}>Navigation</Typography>
            <IconButton
              aria-label="Close navigation"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <CloseOutlinedIcon />
            </IconButton>
          </Box>
          {sidebar}
        </Drawer>
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ ...appMain, position: "relative", "&:focus": { outline: "none" } }}
        >
          {/*
            The Suspense boundary stays mounted across navigations. Because
            React Router navigates inside a transition, the current page stays
            on screen while the next page's code loads; the skeleton only
            appears on the very first load.
          */}
          <Suspense fallback={<PageLoadingSkeleton />}>
            <ErrorBoundary
              key={location.pathname}
              fallback={<ErrorPage code="generic" />}
            >
              <Outlet />
            </ErrorBoundary>
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
