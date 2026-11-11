/** Ticket dialogs. */
import { type SxProps } from "@mui/material";
import { type Theme } from "@mui/material/styles";
import { RADIUS_PX, STATUS_TONES, insetSx } from "@/styles/tokens";

// components/tickets/CreateModal.styles.ts
export const attachmentDropZoneSx: SxProps<Theme> = {
  ...insetSx,
  border: "1px dashed",
  borderColor: "divider",
  borderRadius: RADIUS_PX.sm,
  display: "flex",
  alignItems: "center",
  gap: 2,
  flexWrap: "wrap",
};

/** Shared attachment button  styles style or helper for the related interface. */
export const attachmentButtonSx: SxProps<Theme> = { flexShrink: 0 };

/** Shared ticket attachment list  styles style or helper for the related interface. */
export const ticketAttachmentListSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  alignItems: "center",
  flex: 1,
};

/** Shared attachment chip  styles style or helper for the related interface. */
export const attachmentChipSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  bgcolor: "grey.100",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.pill,
  px: 1,
  py: 0.25,
};

/** Shared ticket attachment name  styles style or helper for the related interface. */
export const ticketAttachmentNameSx: SxProps<Theme> = {
  maxWidth: 160,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/** Shared attachment remove button  styles style or helper for the related interface. */
export const attachmentRemoveButtonSx: SxProps<Theme> = {
  ml: 0.5,
  p: 0.5,
};

// components/tickets/DetailModal.callback.styles.ts
// components/tickets/DetailModal.dynamic.styles.ts
// components/tickets/DetailModal.styles.ts
export const ratingSelectedLabelSx: SxProps<Theme> = {
  fontWeight: 600,
  color: "primary.main",
};

// components/tickets/RatingInfoModel.dynamic.styles.ts
export const ratingTileSx = ({
  item,
}: {
  item: { score: number };
}): SxProps<Theme> => ({
  ...insetSx,
  height: "100%",
  textAlign: "center",
  bgcolor: item.score >= 4
    ? (theme: Theme) => STATUS_TONES[theme.palette.mode].success.fill
    : "background.paper",
});

// components/tickets/RatingInfoModel.styles.ts
export const ratingGuideTextSx: SxProps<Theme> = { mt: 1 };

/** Shared rating guide panel  styles style or helper for the related interface. */
export const ratingGuidePanelSx: SxProps<Theme> = { p: 2 };
