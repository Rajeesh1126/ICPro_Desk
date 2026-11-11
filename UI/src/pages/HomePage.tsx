import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { LayoutGroup, motion } from "motion/react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
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
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import logo from "@/assets/icpro_logo.svg";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import Header from "@/components/appBar/Header";
import { AnimatedOutlet } from "@/animations/PageTransition";
import { EASE_OUT, SPRING_SOFT } from "@/animations/presets";
import { MotionBox } from "@/animations/MotionPrimitives";
import { preloadRoute } from "@/routes/lazyPages";
import { useSessionExpiryWatch } from "@/api/session";
import { getStoredPermissions } from "@/utils/permissions";
import { useDocumentTitle } from "@/utils/useDocumentTitle";
import { prefetchTeamSummary } from "@/pages/tickets/teamSummaryQuery";
import { prefetchTeamPerformance } from "@/pages/tickets/teamPerformanceQuery";
import { prefetchApi } from "@/api/useApiQuery";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ErrorPage from "@/pages/ErrorPage";
import PageLoadingSkeleton from "@/components/common/PageLoadingSkeleton";
import {
  appMain,
  appShell,
  positionRelativeSx,
  skipLinkSx,
  appShellBody,
  listItemReset,
  mobileDrawer,
  sidebarContent,
  sidebarIcon,
  sidebarItem,
  sidebarListSx,
  sidebarRowSx,
  sidebarItemText,
  sidebarNav,
  sidebarPanel,
  sidebarSection,
  sidebarSectionDivider,
  sidebarActiveIndicatorSx,
  headerLogoLinkSx,
  mobileDrawerHeaderSx,
  mobileDrawerLogoSx,
} from "@/styles/common";

const sidebarWidth = 265;
const sidebarCollapsedWidth = 76;
const sidebarSectionHeight = 22;
const sidebarOpenKey = "sidebarExpanded";

/** Expand/collapse spring: settles in ~0.3s with no visible overshoot. */
const sidebarSpring = { type: "spring", stiffness: 380, damping: 40, mass: 0.9 } as const;

/** Hover-peek is for mice only, so a tap never sticks the overlay open. */
const finePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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
    label: "ICPro Calendar",
    path: "/Home/ICProCalendar",
    icon: <CalendarMonthOutlinedIcon />,
    activeIcon: <CalendarMonthIcon />,
    // codeName: "view_calendarentry",
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
    icon: <ScheduleOutlinedIcon />,
    activeIcon: <ScheduleIcon />,
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
    label: "Work Let Analysis",
    section: "Analysis",
    path: "/Home/TeamAnalysis",
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
    // Same permission as the route (App.tsx), so everyone who can open the
    // page can also find it in the sidebar.
    codeName: "access_timesheet",
  },
  {
    label: "Users",
    section: "User Management",
    path: "/Home/Users",
    icon: <ManageAccountsOutlinedIcon />,
    activeIcon: <ManageAccountsIcon />,
    codeName: "access_user_management",
  },
  {
    label: "Roles & Permissions",
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
    label: "Lessons Learnt",
    section: "General",
    path: "/Home/LessonLearnt",
    icon: <LightbulbOutlinedIcon />,
    activeIcon: <LightbulbIcon />,
    codeName: "access_lesson_learnt",
  },
  {
    label: "Suggestion / Feedback",
    section: "General",
    path: "/Home/Suggestions",
    icon: <RateReviewOutlinedIcon />,
    activeIcon: <RateReviewIcon />,
    codeName: "access_system_suggetions",
  }
  
] as const;

/** Preload a page's code and, for the busiest dashboard, its default data. */
function warmRoute(path: string) {
  preloadRoute(path);
  if (path === "/Home") {
    void prefetchApi("/erp/quotations/budget-summary/");
  } else if (path === "/Home/Dashboard") {
    void prefetchTeamSummary();
  } else if (path === "/Home/TeamAnalysis") {
    void prefetchTeamPerformance();
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
  // the expanded/collapsed choice survives reloads.
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(sidebarOpenKey) !== "false";
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(sidebarOpenKey, String(desktopSidebarOpen));
    } catch {
      // Storage unavailable (private mode); the default still works.
    }
  }, [desktopSidebarOpen]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  // Collapsed rail temporarily expanded by mouse hover or keyboard focus.
  const [sidebarPeek, setSidebarPeek] = useState<boolean>(false);
  const mainRef = useRef<HTMLElement>(null);
  const [permissions] = useState(getStoredPermissions);

  const visiblePages = useMemo(
    () =>
      pages.filter(
        (page) => !page.codeName || permissions.has(page.codeName),
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

  // Rendered twice (desktop rail, mobile drawer); each copy gets its own
  // LayoutGroup so the active indicators never animate across the two.
  const renderSidebar = (group: string) => (
    <LayoutGroup id={group}>
      <Box sx={sidebarContent}>
        <List disablePadding sx={sidebarListSx}>
          {visiblePages.map((page, index) => {
            const selected =
              page.path === "/Home"
                ? location.pathname === page.path
                : location.pathname === page.path ||
                  location.pathname.startsWith(`${page.path}/`);
            const showSectionHeader =
              page.section && page.section !== visiblePages[index - 1]?.section;
            return (
              <Box key={page.path} component="li" sx={[listItemReset, positionRelativeSx, sidebarRowSx]}>
                {showSectionHeader && (
                  <Box sx={positionRelativeSx}>
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
                {/* Accent pill that glides to the newly selected item. */}
                {selected && (
                  <Box
                    component={motion.span}
                    layoutId="sidebar-active"
                    transition={SPRING_SOFT}
                    aria-hidden
                    sx={sidebarActiveIndicatorSx()}
                  />
                )}
                <ListItemButton
                  component={RouterLink}
                  to={page.path}
                  selected={selected}
                  aria-current={selected ? "page" : undefined}
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
    </LayoutGroup>
  );

  return (
    <Box sx={appShell}>
      {/* First tab stop: jump past the header and sidebar to the page. */}
      <Box
        component="a"
        href="#main-content"
        sx={skipLinkSx}
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
        <MotionBox
          component="nav"
          initial={false}
          animate={{ width: desktopSidebarOpen ? sidebarWidth : sidebarCollapsedWidth }}
          transition={sidebarSpring}
          onMouseEnter={() => {
            if (!desktopSidebarOpen && finePointer()) setSidebarPeek(true);
          }}
          onMouseLeave={() => setSidebarPeek(false)}
          onFocus={(event: FocusEvent<HTMLElement>) => {
            // Keyboard focus only; a mouse click must not pin the overlay open.
            if (!desktopSidebarOpen && event.target.matches(":focus-visible")) {
              setSidebarPeek(true);
            }
          }}
          onBlur={(event: FocusEvent<HTMLElement>) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setSidebarPeek(false);
          }}
          sx={sidebarNav(
            desktopSidebarOpen,
            sidebarWidth,
            sidebarCollapsedWidth,
          )}
          aria-label="Primary navigation"
        >
          {/* The rail springs open/closed; a collapsed rail peeks open on hover. */}
          <MotionBox
            className="sidebar-panel"
            initial={false}
            animate={{
              width: desktopSidebarOpen || sidebarPeek ? sidebarWidth : sidebarCollapsedWidth,
            }}
            transition={sidebarSpring}
            sx={sidebarPanel(
              desktopSidebarOpen,
              sidebarWidth,
              sidebarCollapsedWidth,
              sidebarSectionHeight,
            )}
          >
            {renderSidebar("desktop-sidebar")}
          </MotionBox>
        </MotionBox>
        <Drawer
          variant="temporary"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={mobileDrawer}
        >
          <Box sx={mobileDrawerHeaderSx}>
            {/* Slides in with the drawer, just behind it. */}
            <motion.div
              initial={false}
              animate={mobileSidebarOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
              transition={{ duration: 0.3, ease: EASE_OUT, delay: mobileSidebarOpen ? 0.08 : 0 }}
              style={{ display: "flex" }}
            >
              <Box
                component={RouterLink}
                to="/Home"
                aria-label="ICPro home"
                onClick={() => setMobileSidebarOpen(false)}
                sx={headerLogoLinkSx}
              >
                <Box component="img" src={logo} alt="ICPro" sx={mobileDrawerLogoSx} />
              </Box>
            </motion.div>
            <Tooltip title="Close navigation">
              <IconButton
                aria-label="Close navigation"
                onClick={() => setMobileSidebarOpen(false)}
              >
                {/* Turns a quarter as the drawer opens. */}
                <motion.span
                  initial={false}
                  animate={{ rotate: mobileSidebarOpen ? 0 : -90 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  style={{ display: "inline-flex" }}
                >
                  <CloseRoundedIcon />
                </motion.span>
              </IconButton>
            </Tooltip>
          </Box>
          {renderSidebar("mobile-sidebar")}
        </Drawer>
        <Box
            component="main"
            id="main-content"
            ref={mainRef}
            tabIndex={-1}
            aria-label={currentPageLabel}
            sx={appMain}
          >
            {/*
              The Suspense boundary stays mounted across navigations. Because
              React Router navigates inside a transition, the current page stays
              on screen while the next page's code loads; the skeleton only
              appears on the very first load.
            */}
            <Suspense fallback={<PageLoadingSkeleton />}>
              {/* Old page fades out, new one rises in; scroll resets in between. */}
              <AnimatedOutlet
                onExitComplete={() => {
                  mainRef.current?.scrollTo({ top: 0 });
                  // Keyboard and screen-reader users start on the new page.
                  mainRef.current?.focus({ preventScroll: true });
                }}
                frame={(page) => (
                  <ErrorBoundary fallback={<ErrorPage code="generic" />}>
                    {page}
                  </ErrorBoundary>
                )}
              />
            </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
