import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import bgImage from "../assets/taskmanagementloginimage.jpg";
import logo from "../assets/icpro_logo.svg";
import api from "../api/axios";
import { loginDynamicPageDynamicBoxSx1, loginPageBoxSx1, loginPageBoxSx2, loginPageButtonSx1, loginPageCardContentSx1, loginPageCardSx1, loginPageCircularProgressSx1, loginPageTypographySx1, loginPageTypographySx2, marginBottomSectionSx } from "../styles/common";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/users/login/", { username, password });
      console.log(response)
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("user", response.data.id);
      localStorage.setItem("first_name", response.data.first_name);
      
      localStorage.setItem("role", response.data.role);
      localStorage.setItem(
        "permissions",
        JSON.stringify(response.data.permissions ?? [])
      );
      navigate("/Home");
    } catch {
      setError("We could not sign you in. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={loginDynamicPageDynamicBoxSx1({ bgImage })}
    >
      <Card
        sx={loginPageCardSx1}
      >
        <CardContent
          sx={loginPageCardContentSx1}
        >
          <Box
            component="img"
            src={logo}
            alt="ICPro"
            sx={loginPageBoxSx1}
          />
          <Box
            sx={loginPageBoxSx2}
          >
            <LockRoundedIcon />
          </Box>
          <Typography variant="h5" align="center">
            Welcome back
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={loginPageTypographySx1}>
            Use your Timesheet App credentials to continue.
          </Typography>

          {error && <Alert severity="error" sx={marginBottomSectionSx}>{error}</Alert>}

          <Box component="form" onSubmit={(event) => { event.preventDefault(); void handleLogin(); }}>
            <TextField fullWidth
              label="Username"
              autoComplete="username"
              value={username} onChange={(event) => setUsername(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><PersonOutlineRoundedIcon
                    color="action" fontSize="small" /></InputAdornment>
                }
              }} sx={marginBottomSectionSx}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockRoundedIcon color="action" fontSize="small" /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} onMouseDown={(event) => event.preventDefault()} edge="end">{showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}</IconButton></InputAdornment> } }}
              required
            />
            <Button fullWidth type="submit" autoFocus variant="contained" color="primary" size="large" disabled={loading} startIcon={loading ? undefined : <LoginRoundedIcon />} sx={loginPageButtonSx1}>
              {loading ? <><CircularProgress size={20} color="inherit" sx={loginPageCircularProgressSx1} /> Signing in…</> : "Sign In"}
            </Button>
            <Typography variant="caption" align="center" color="text.secondary" display="block" sx={loginPageTypographySx2}>
              Contact your administrator if you cannot access your account.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}