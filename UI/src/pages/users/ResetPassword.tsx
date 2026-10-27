import { useDocumentTitle } from "@/utils/useDocumentTitle";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import api from "@/api/axios";
import { getErrorStatus, sanitizeUserMessage } from "@/utils/errorUtils";
import bgImage from "@/assets/taskmanagementloginimage.jpg";
import logo from "@/assets/icpro_logo.svg";
import {
  authPageBackgroundSx,
  authLogoSx,
  authSubmitButtonSx,
  authCardContentSx,
  authCardSx,
  authSpinnerSx,
  marginBottomSectionSx,
  authIntroSx,
  authLinkSx,
} from "@/styles/common";

type ResetPasswordField = "email" | "token" | "new_password" | "confirm_password";
type ResetPasswordErrors = Partial<
  Record<ResetPasswordField | "non_field_errors" | "detail", string | string[]>
>;
type ResetPasswordErrorResponse = {
  response?: {
    status?: number;
    data?: ResetPasswordErrors;
  };
};

function isResetPasswordErrorResponse(
  error: unknown,
): error is ResetPasswordErrorResponse {
  return typeof error === "object" && error !== null && "response" in error;
}

function formatFieldError(error?: string | string[]) {
  if (Array.isArray(error)) {
    return sanitizeUserMessage(error.join(" "));
  }

  return error ? sanitizeUserMessage(error) : undefined;
}

export default function ResetPassword() {
  useDocumentTitle("Reset password");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromLink = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const tokenFromLink = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [email, setEmail] = useState(emailFromLink);
  const [token, setToken] = useState(tokenFromLink);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordErrors>({});

  const confirmMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const clearFieldError = (field: ResetPasswordField) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submitResetPassword = async () => {
    setLoading(true);
    setError("");
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setFieldErrors({
        confirm_password: "New password and confirm password do not match.",
      });
      setLoading(false);
      return;
    }

    try {
      await api.post("/users/reset_password/", {
        email,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      navigate("/", {
        replace: true,
        state: { message: "Password reset successfully. Please login." },
      });
    } catch (requestError: unknown) {
      if (isResetPasswordErrorResponse(requestError) && getErrorStatus(requestError) === 400) {
        const errors = requestError.response?.data ?? {};
        setFieldErrors(errors);
        setError(
          formatFieldError(errors.non_field_errors) ||
            formatFieldError(errors.detail) ||
            "",
        );
      } else {
        const status = getErrorStatus(requestError);
        setError(
          status === 429
            ? "Please wait a moment before trying again."
            : "Unable to reset your password. Please request a new link and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="main" sx={authPageBackgroundSx({ bgImage })}>
      <Card sx={authCardSx}>
        <CardContent sx={authCardContentSx}>
          <Box component="img" src={logo} alt="ICPro" sx={authLogoSx} />
          <Typography variant="h5" component="h1" align="center">
            Reset Password
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={authIntroSx}>
            Enter your new password to continue.
          </Typography>

          {error && <Alert severity="error" sx={marginBottomSectionSx}>{error}</Alert>}

          <Box component="form" onSubmit={(event) => { event.preventDefault(); void submitResetPassword(); }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                clearFieldError("email");
                setEmail(event.target.value);
              }}
              required
              error={Boolean(fieldErrors.email)}
              helperText={formatFieldError(fieldErrors.email)}
              sx={marginBottomSectionSx}
            />
            {!tokenFromLink && (
              <TextField
                fullWidth
                label="Reset code"
                value={token}
                onChange={(event) => {
                  clearFieldError("token");
                  setToken(event.target.value);
                }}
                required
                error={Boolean(fieldErrors.token)}
                helperText={formatFieldError(fieldErrors.token) || "Copy the code from your reset email."}
                sx={marginBottomSectionSx}
              />
            )}
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => {
                clearFieldError("new_password");
                setNewPassword(event.target.value);
              }}
              required
              error={Boolean(fieldErrors.new_password)}
              helperText={
                formatFieldError(fieldErrors.new_password) ||
                "Use at least 8 characters. Avoid common words and numbers only."
              }
              sx={marginBottomSectionSx}
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
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((visible) => !visible)}
                        onMouseDown={(event) => event.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => {
                clearFieldError("confirm_password");
                setConfirmPassword(event.target.value);
              }}
              required
              error={Boolean(fieldErrors.confirm_password) || confirmMismatch}
              helperText={
                formatFieldError(fieldErrors.confirm_password) ||
                (confirmMismatch ? "Passwords do not match yet." : " ")
              }
              sx={marginBottomSectionSx}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? undefined : <LockResetOutlinedIcon />}
              sx={authSubmitButtonSx}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={authSpinnerSx} />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
            <Typography
              component={RouterLink}
              to="/"
              variant="body2"
              align="center"
              color="primary.main"
              display="block"
              sx={authLinkSx}
            >
              Back to login
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
