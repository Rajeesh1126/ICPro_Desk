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
    label: "Document Templates",
    section: "General",
    path: "/Home/Documents",
    icon: <DescriptionOutlinedIcon />,
    activeIcon: <DescriptionIcon />,
    iconColor: "#455a64",
    codeName: "access_document_template",
  },
  {
    label: "Suggestion / Feedback",
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
    label: "Timesheet Logs",
    section: "Analysis",
    path: "/Home/TimesheetLogs",
    icon: <RuleFolderOutlinedIcon />,
    activeIcon: <RuleFolderIcon />,
    iconColor: "#7b1fa2",
    codeName: "access_timesheet_log",
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
