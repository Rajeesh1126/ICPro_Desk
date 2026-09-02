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
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

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

export default function ResetPassword() {
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

  const submitResetPassword = async () => {
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
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
    } catch {
      setError("Unable to reset password. The link may be invalid or expired.");
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
            Reset Password
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
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
              onChange={(event) => setEmail(event.target.value)}
              required
              sx={marginBottomSectionSx}
            />
            <TextField
              fullWidth
              label="Token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
              sx={marginBottomSectionSx}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              sx={marginBottomSectionSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon color="action" fontSize="small" />
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
                        {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
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
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              sx={marginBottomSectionSx}
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
