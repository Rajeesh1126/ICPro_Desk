import type { ComponentProps, ComponentType, ElementType } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import TimerOffOutlinedIcon from "@mui/icons-material/TimerOffOutlined";
import WifiOffOutlinedIcon from "@mui/icons-material/WifiOffOutlined";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  errorActionsSx,
  errorCodeSx,
  errorIconSx,
  errorMessageSx,
  errorPageSx,
  errorPanelSx,
  errorTitleSx,
} from "@/styles/common";
import { buildLoginPath, clearSession } from "@/api/session";
import { motion } from "motion/react";
import { MotionBox, MotionPaper } from "@/animations/MotionPrimitives";
import { fadeUp, staggerContainer } from "@/animations/presets";

const BaseMotionTypography = motion.create(Typography);
// Typography's `component` prop survives motion.create; restore its type.
const MotionTypography = BaseMotionTypography as ComponentType<
  ComponentProps<typeof BaseMotionTypography> & { component?: ElementType }
>;
const MotionStack = motion.create(Stack);

type ErrorCode = number | "network" | "generic";

type ErrorConfig = {
  code: ErrorCode;
  title: string;
  message: string;
  icon: React.ReactNode;
  primary: "dashboard" | "signin" | "retry" | "refresh" | "home";
  secondary?: "back" | "dashboard" | "home";
};

const configs: Record<string, ErrorConfig> = {
  "400": {
    code: 400,
    title: "We could not process that request",
    message: "Check the information and try again.",
    icon: <ErrorOutlineOutlinedIcon />,
    primary: "dashboard",
    secondary: "back",
  },
  "401": {
    code: 401,
    title: "Your session has expired",
    message: "Please sign in again to continue securely.",
    icon: <LoginOutlinedIcon />,
    primary: "signin",
    secondary: "home",
  },
  "403": {
    code: 403,
    title: "You do not have access to this page",
    message:
      "Your account does not have the required permission. Contact an administrator if you believe this is incorrect.",
    icon: <BlockOutlinedIcon />,
    // Retrying can't grant a missing permission; offer a way out instead.
    primary: "home",
    secondary: "back",
  },
  "404": {
    code: 404,
    title: "We could not find that page",
    message:
      "The page may have been moved, renamed, or is no longer available.",
    icon: <SearchOffOutlinedIcon />,
    primary: "home",
    secondary: "back",
  },
  "408": {
    code: 408,
    title: "The request took too long",
    message: "Please check your connection and try again.",
    icon: <TimerOffOutlinedIcon />,
    primary: "retry",
    secondary: "back",
  },
  "429": {
    code: 429,
    title: "Too many requests",
    message: "Please wait a moment before trying again.",
    icon: <TimerOffOutlinedIcon />,
    primary: "retry",
    // secondary: "dashboard",
  },
  "500": {
    code: 500,
    title: "Something went wrong",
    message:
      "We could not complete your request. Please try again. If the problem continues, contact support.",
    icon: <ErrorOutlineOutlinedIcon />,
    primary: "retry",
    // secondary: "dashboard",
  },
  "502": {
    code: 502,
    title: "Service unavailable",
    message:
      "The service is temporarily unavailable. Please try again shortly.",
    icon: <ErrorOutlineOutlinedIcon />,
    primary: "refresh",
    // secondary: "dashboard",
  },
  "503": {
    code: 503,
    title: "Service temporarily unavailable",
    message:
      "We are having trouble reaching the service right now. Please try again soon.",
    icon: <ErrorOutlineOutlinedIcon />,
    primary: "refresh",
    // secondary: "dashboard",
  },
  network: {
    code: "network",
    title: "Unable to connect to the service",
    message:
      "The server could not be reached. Check your network connection or confirm that the service is running, then try again.",
    icon: <WifiOffOutlinedIcon />,
    primary: "retry",
    // secondary: "dashboard",
  },
  generic: {
    code: "generic",
    title: "Something went wrong",
    message: "Please try again. If the problem continues, contact support.",
    icon: <ErrorOutlineOutlinedIcon />,
    primary: "refresh",
    // secondary: "home",
  },
};

function getErrorConfig(code: ErrorCode): ErrorConfig {
  if (code === "network" || code === "generic") return configs[code];

  return (
    configs[String(code)] ?? {
      code,
      title: "We could not complete your request",
      message:
        "An unexpected response was received. Please try again, or contact support if the problem continues.",
      icon: <ErrorOutlineOutlinedIcon />,
      primary: "refresh",
      secondary: "dashboard",
    }
  );
}

function actionLabel(
  action: ErrorConfig["primary"] | NonNullable<ErrorConfig["secondary"]>,
) {
  return {
    back: "Go back",
    dashboard: "Go to Home",
    home: "Go to Home",
    refresh: "Refresh",
    retry: "Retry",
    signin: "Sign in",
  }[action];
}

export default function ErrorPage({ code = 404 }: { code?: ErrorCode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const config = getErrorConfig(code);
  const requestedReturnTo = new URLSearchParams(location.search).get(
    "returnTo",
  );
  const returnTo =
    requestedReturnTo?.startsWith("/") && !requestedReturnTo.startsWith("//")
      ? requestedReturnTo
      : "/Home";

  const runAction = (action: string) => {
    if (action === "back") navigate(-1);
    // Home is the dashboard every account can open (Team Analysis is gated).
    if (action === "dashboard") navigate("/Home");
    if (action === "home") navigate("/Home");
    if (action === "signin") {
      clearSession();
      navigate(buildLoginPath(requestedReturnTo, true));
    }
    if (action === "retry") navigate(returnTo);
    if (action === "refresh") window.location.reload();
  };

  return (
    <Box sx={errorPageSx}>
      {/* Icon lands first, then code, title, message and actions in turn. */}
      <MotionPaper
        elevation={0}
        variants={staggerContainer(0.07, 0.05)}
        initial="hidden"
        animate="visible"
        sx={errorPanelSx}
      >
        <MotionBox
          variants={{
            hidden: { opacity: 0, scale: 0.6, rotate: -12 },
            visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 380, damping: 16 } },
          }}
          sx={errorIconSx}
        >
          {config.icon}
        </MotionBox>
        <MotionTypography variants={fadeUp} component="p" sx={errorCodeSx}>
          {config.code === "network"
            ? "Connection issue"
            : config.code === "generic"
              ? "Unexpected error"
              : `Error ${config.code}`}
        </MotionTypography>
        <MotionTypography variants={fadeUp} component="h1" sx={errorTitleSx}>
          {config.title}
        </MotionTypography>
        <MotionTypography variants={fadeUp} component="p" role="alert" sx={errorMessageSx}>
          {config.message}
        </MotionTypography>
        <MotionStack
          variants={fadeUp}
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={errorActionsSx}
        >
          <Button
            variant="contained"
            startIcon={
              config.primary === "signin" ? (
                <LoginOutlinedIcon />
              ) : (
                <RefreshOutlinedIcon />
              )
            }
            onClick={() => runAction(config.primary)}
          >
            {actionLabel(config.primary)}
          </Button>
          {config.secondary  && (
            <Button
              variant="outlined"
              startIcon={
                config.secondary === "back" ? (
                  <ReplyOutlinedIcon />
                ) : (
                  <HomeOutlinedIcon />
                )
              }
              onClick={() => runAction(config.secondary!)}
            >
              {actionLabel(config.secondary)}
            </Button>
          )}
        </MotionStack>
      </MotionPaper>
    </Box>
  );
}

/** Routed Error Page declaration used across the frontend. */
export function RoutedErrorPage() {
  const { code } = useParams<{ code?: string }>();
  const parsedCode = Number(code);

  return (
    <ErrorPage
      code={
        code === "network"
          ? "network"
          : Number.isInteger(parsedCode) && parsedCode >= 400
            ? parsedCode
            : "generic"
      }
    />
  );
}
