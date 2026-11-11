import { Box } from "@mui/material";
import bgImage from "@/assets/taskmanagementloginimage.jpg";
import { FlipOutlet } from "@/animations/PageTransition";
import { authPageBackgroundSx } from "@/styles/common";

/** Flip order: moving right in this list flips forward, left flips back. */
const authFlipOrder = ["/", "/forgot-password", "/reset-password"] as const;

/**
 * Shared backdrop for the sign-in pages. The photo stays put while the card
 * flips between Login, Forgot password and Reset password, so switching
 * forms reads as turning one card over rather than loading a new page.
 */
export default function AuthLayout() {
  // The forms are bundled with this layout (see App.tsx), so the flip never
  // suspends between the outgoing and incoming card.
  return (
    <Box component="main" sx={authPageBackgroundSx({ bgImage })}>
      <FlipOutlet order={authFlipOrder} />
    </Box>
  );
}
