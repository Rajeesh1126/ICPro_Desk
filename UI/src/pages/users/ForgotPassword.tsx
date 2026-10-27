import { useDocumentTitle } from "@/utils/useDocumentTitle";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ForwardToInboxOutlinedIcon from "@mui/icons-material/ForwardToInboxOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import api from "@/api/axios";
import { getErrorStatus, sanitizeUserMessage } from "@/utils/errorUtils";
import bgImage from "@/assets/taskmanagementloginimage.jpg";
import AuthCardHeader from "@/components/common/AuthCardHeader";
import {
  authPageBackgroundSx,
  authSubmitButtonSx,
  authCardContentSx,
  authCardSx,
  authSpinnerSx,
  marginBottomSectionSx,
  authBackLinkSx,
  authIntroSx,
} from "@/styles/common";

type ForgotPasswordResponse = { message?: string };

export default function ForgotPassword() {
  useDocumentTitle("Forgot password");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submitForgotPassword = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post<ForgotPasswordResponse>("/users/forgot_password/", {
        username,
        email,
      });
      setMessage(sanitizeUserMessage(
        response.data?.message,
        "If the account details match, a password reset link has been sent.",
      ));
    } catch (requestError: unknown) {
      const status = getErrorStatus(requestError);
      setError(
        status === 400
          ? "Please check your username and email."
          : status === 429
            ? "Please wait a moment before trying again."
            : "Unable to send the reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="main" sx={authPageBackgroundSx({ bgImage })}>
      <Card sx={authCardSx}>
        <CardContent sx={authCardContentSx}>
          <AuthCardHeader />
          <Typography variant="h5" component="h1" align="center">
            Forgot Password
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={authIntroSx}>
            Enter your username and email to receive a reset link.
          </Typography>

          {message && <Alert severity="success" sx={marginBottomSectionSx}>{message}</Alert>}
          {error && <Alert severity="error" sx={marginBottomSectionSx}>{error}</Alert>}

          <Box component="form" onSubmit={(event) => { event.preventDefault(); void submitForgotPassword(); }}>
            <TextField
              fullWidth
              label="Username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              sx={marginBottomSectionSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              sx={marginBottomSectionSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? undefined : <ForwardToInboxOutlinedIcon />}
              sx={authSubmitButtonSx}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={authSpinnerSx} />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
            <Typography
              component={RouterLink}
              to="/"
              variant="body2"
              color="primary.main"
              sx={authBackLinkSx}
            >
              <LoginOutlinedIcon fontSize="small" />
              Back to login
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
