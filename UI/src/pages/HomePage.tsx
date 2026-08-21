import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
} from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import Header from "../components/AppBar/header";
import api from "../api/axios";

const SIDEBAR_WIDTH = 265;
const SIDEBAR_COLLAPSED_WIDTH = 64;

const pages = [
    {
        label: "Home",
        path: "/Home",
        icon: <HomeRoundedIcon />,
        iconColor: "#1976d2",
    },
    {
        label: "Do List",
        path: "/Home/SelfTickets",
        icon: <FormatListBulletedRoundedIcon />,
        iconColor: "#0288d1",
        codeName: "view_self_tickets",
    },
    {
        label: "Tickets",
        path: "/Home/Tickets",
        icon: <ConfirmationNumberRoundedIcon />,
        iconColor: "#2e7d32",
        codeName: "view_ticket",
    },
    {
        label: "Timesheet",
        path: "/Home/TimeSheet",
        icon: <FactCheckRoundedIcon />,
        iconColor: "#d32f2f",
        codeName: "view_submission",
    },
    {
        label: "Executive Overview",
        path: "/Home/Reports",
        icon: <AssessmentRoundedIcon />,
        iconColor: "#ed6c02",
        codeName: "view_managementoverview",
    },
    {
        label: "Team Analysis",
        path: "/Home/Dashboard",
        icon: <AnalyticsRoundedIcon />,
        iconColor: "#9c27b0",
        codeName: "view_managementoverview",
    },
    {
        label: "Users Managment",
        path: "/Home/Users",
        icon: <FactCheckRoundedIcon />,
        iconColor: "#088da5",
        codeName: "view_user",
    },
    {
        label: "Roles Managment",
        path: "/Home/Roles",
        icon: <FactCheckRoundedIcon />,
        iconColor: "#088da5",
        codeName: "view_role",
    },
] as const satisfies readonly {
    label: string;
    path: string;
    icon: ReactNode;
    iconColor: `#${string}`;
    codeName?: string;
}[];

const sidebarItemSx =
    (selected: boolean, iconColor: `#${string}`) => (theme: Theme) => {
        return {
            borderRadius: 1,
            mb: 0.5,
            minHeight: 44,
            overflow: "hidden",
            px: 0,
            py: 1,
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
    const [permissions, setPermissions] =
        useState<string[]>(getStoredPermissions);

    const visiblePages = useMemo(
        () =>
            pages.filter(
                (page) => !("codeName" in page) || permissions.includes(page.codeName),
            ),
        [permissions],
    );

    const sidebarContent = (
        <Box sx={{ p: 1 }}>
            <List disablePadding>
                {visiblePages.map((page) => {
                    const selected =
                        page.path === "/Home"
                            ? location.pathname === page.path
                            : location.pathname === page.path ||
                            location.pathname.startsWith(`${page.path}/`);
                    return (
                        <ListItemButton
                            key={page.path}
                            component={RouterLink}
                            to={page.path}
                            selected={selected}
                            onClick={() => {
                                if (!isSidebarLayout) setMobileSidebarOpen(false);
                            }}
                            sx={sidebarItemSx(selected, page.iconColor)}
                        >
                            <ListItemIcon sx={sidebarIconSx(selected, page.iconColor)}>
                                {page.icon}
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
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
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
                    minHeight: { xs: "calc(100dvh - 58px)", sm: "calc(100dvh - 64px)" },
                }}
            >
                <Box
                    component="nav"
                    sx={(theme) => ({
                        display: { xs: "none", sm: "block" },
                        width: desktopSidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
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
                            width: desktopSidebarOpen
                                ? SIDEBAR_WIDTH
                                : SIDEBAR_COLLAPSED_WIDTH,
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
                                "&:hover": {
                                    width: SIDEBAR_WIDTH,
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
                <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
