/** Error pages. */
import { FONT } from "@/styles/tokens";

// pages/errorPages.ts
export const errorPageSx = {
  alignItems: "center",
  bgcolor: "background.default",
  display: "grid",
  flex: 1,
  minHeight: "100%",
  p: { xs: 2, sm: 3 },
};

/** Shared error panel  styles style or helper for the related interface. */
export const errorPanelSx = {
  border: "1px solid",
  borderColor: "divider",
  maxWidth: 560,
  mx: "auto",
  p: { xs: 3, sm: 5 },
  textAlign: "center",
  width: "100%",
};

/** Shared error icon  styles style or helper for the related interface. */
export const errorIconSx = {
  color: "primary.main",
  display: "grid",
  fontSize: FONT.display,
  mb: 2,
  placeItems: "center",
};

/** Shared error code  styles style or helper for the related interface. */
export const errorCodeSx = {
  color: "text.secondary",
  fontSize: FONT.xs,
  fontWeight: 600,
  lineHeight: 1.5,
};

/** Shared error title  styles style or helper for the related interface. */
export const errorTitleSx = {
  color: "text.primary",
  fontSize: { xs: FONT.lg, sm: FONT.lg },
  fontWeight: 600,
  lineHeight: 1.3,
  mt: 0.5,
};

/** Shared error message  styles style or helper for the related interface. */
export const errorMessageSx = {
  color: "text.secondary",
  fontSize: FONT.sm,
  lineHeight: 1.6,
  mt: 1,
};

/** Shared error actions  styles style or helper for the related interface. */
export const errorActionsSx = {
  justifyContent: "center",
  mt: 3,
};
