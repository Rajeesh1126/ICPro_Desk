import { Box, IconButton, Tooltip } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { motion } from "motion/react";
import { IconSwap } from "@/animations/MotionPrimitives";
import logo from "@/assets/icpro_logo.svg";
import { useThemeMode } from "@/styles/theme/themeModeContext";
import { tapPress } from "@/animations/presets";
import { authLogoSx, authThemeToggleSx } from "@/styles/common";

/**
 * Top of every sign-in card: the theme toggle in the corner and the logo.
 * Shared so Login and Forgot password always look the same above the form.
 */
export default function AuthCardHeader() {
  const { mode, toggleMode } = useThemeMode();
  const toggleLabel =
    mode === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <>
      <Tooltip title={toggleLabel}>
        <IconButton
          component={motion.button}
          whileTap={tapPress}
          aria-label={toggleLabel}
          onClick={toggleMode}
          sx={authThemeToggleSx}
        >
          <IconSwap swapKey={mode}>
            {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconSwap>
        </IconButton>
      </Tooltip>
      <Box component="img" src={logo} alt="ICPro" sx={authLogoSx} />
    </>
  );
}
