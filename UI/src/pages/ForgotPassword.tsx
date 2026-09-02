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
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

import api from "../api/axios";
import bgImage from "../assets/taskmanagementloginimage.jpg";
import logo from "../assets/icpro_logo.svg";
import {
  loginDynamicPageDynamicBoxSx1,
  loginPageBoxSx1,
  loginPageButtonSx1,
  loginPageCardContentSx1,
  loginPageCardSx1,
  loginPageCircularProgressSx1,
  marginBottomSectionSx,
} from "../styles/common";

export default function ForgotPassword() {
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
      const response = await api.post("/users/forgot_password/", {
        username,
        email,
      });
      setMessage(
        response.data?.message ||
          "If the account details match, a password reset link has been sent.",
      );
    } catch {
      setError("Unable to send reset link. Check username and email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={loginDynamicPageDynamicBoxSx1({ bgImage })}>
      <Card sx={loginPageCardSx1}>
        <CardContent sx={loginPageCardContentSx1}>
          <Box component="img" src={logo} alt="ICPro" sx={loginPageBoxSx1} />
          <Typography variant="h5" align="center">
            Forgot Password
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
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
                      <PersonOutlineRoundedIcon color="action" fontSize="small" />
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
                      <EmailRoundedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={loginPageButtonSx1}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={loginPageCircularProgressSx1} />
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
              align="center"
              color="primary.main"
              display="block"
              sx={{ mt: 2, fontWeight: 700, textDecoration: "none" }}
            >
              Back to login
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
