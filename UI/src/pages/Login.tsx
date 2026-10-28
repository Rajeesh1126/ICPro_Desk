import { useDocumentTitle } from "@/utils/useDocumentTitle";
import { useState } from "react";
import { Link as RouterLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import bgImage from "@/assets/taskmanagementloginimage.jpg";
import api from "@/api/axios";
import { queryClient } from "@/api/queryClient";
import { getErrorStatus } from "@/utils/errorUtils";
import AuthCardHeader from "@/components/common/AuthCardHeader";
import {
  getSafeReturnTo,
  hasActiveSession,
  RETURN_TO_PARAM,
  SESSION_EXPIRED_PARAM,
  SESSION_EXPIRED_VALUE,
} from "@/api/session";
import {
  authPageBackgroundSx,
  authSubmitButtonSx,
  authCardContentSx,
  authCardSx,
  authSpinnerSx,
  authFootnoteSx,
  marginBottomSectionSx,
  authLinkSx,
} from "@/styles/common";

type LoginResponse = {
  refresh: string;
  access: string;
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  reporting_to_first_name: string;
  reporting_to_last_name: string;
  designation: string;
  role: string;
  permissions: string[];
};

export default function Login() {
  useDocumentTitle("Sign in");
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const successMessage =
    typeof location.state === "object" &&
    location.state !== null &&
    "message" in location.state
      ? String(location.state.message)
      : "";
  const searchParams = new URLSearchParams(location.search);
  const sessionExpired =
    searchParams.get(SESSION_EXPIRED_PARAM) === SESSION_EXPIRED_VALUE;
  const returnTo = getSafeReturnTo(searchParams.get(RETURN_TO_PARAM));

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post<LoginResponse>("/users/login/", {
        username,
        password,
      });
      queryClient.clear();

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", String(response.data.id));
      localStorage.setItem("first_name", response.data.first_name);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: response.data.id,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          reporting_to_first_name: response.data.reporting_to_first_name,
          reporting_to_last_name: response.data.reporting_to_last_name,
          designation: response.data.designation,
          role: response.data.role,
        }),
      );
      localStorage.setItem(
        "permissions",
        JSON.stringify(response.data.permissions ?? []),
      );
      navigate(returnTo ?? "/Home", { replace: true });
    } catch (requestError: unknown) {
      const status = getErrorStatus(requestError);
      setError(
        status === 400 || status === 401
          ? "Incorrect username or password."
          : status === 429
            ? "Please wait a moment and try again."
            : "Unable to sign in right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };


  // Already signed in (e.g. opened "/" or used Back): skip the form.
  if (hasActiveSession()) {
    return <Navigate to={returnTo ?? "/Home"} replace />;
  }

  return (
    <Box component="main" sx={authPageBackgroundSx({ bgImage })}>
      <Card sx={authCardSx}>
        <CardContent sx={authCardContentSx}>
          <AuthCardHeader />
          {/* <Box sx={authIconBadgeSx}>
            <LockOutlinedIcon />
          </Box> */}
          {/* <Typography variant="h5" component="h1" align="center" sx={authSubtitleSx}>
            Welcome back
          </Typography> */}
          {/* <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={authSubtitleSx}
          >
            Use your Timesheet App credentials to continue.
          </Typography> */}

          {sessionExpired && !error && (
            <Alert severity="warning" sx={marginBottomSectionSx}>
              Your session expired for security. Sign in again
              {returnTo ? " to return to the page you were on." : " to continue."}
            </Alert>
          )}
          {!sessionExpired && returnTo && !error && (
            <Alert severity="info" sx={marginBottomSectionSx}>
              Sign in to continue to the page you requested.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={marginBottomSectionSx}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={marginBottomSectionSx}>
              {successMessage}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleLogin();
            }}
          >
            <TextField
              autoFocus
              fullWidth
              label="Username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon
                        color="action"
                        fontSize="small"
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={marginBottomSectionSx}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((visible) => !visible)}
                        onMouseDown={(event) => event.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffOutlinedIcon />
                        ) : (
                          <VisibilityOutlinedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? undefined : <LoginOutlinedIcon />}
              sx={authSubmitButtonSx}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={20}
                    color="inherit"
                    sx={authSpinnerSx}
                  />{" "}
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <Typography
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              align="center"
              color="primary.main"
              display="block"
              sx={authLinkSx}
            >
              Forgot password?
            </Typography>
            <Typography
              variant="caption"
              align="center"
              color="text.secondary"
              display="block"
              sx={authFootnoteSx}
            >
              Contact your administrator if you cannot access your account.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
