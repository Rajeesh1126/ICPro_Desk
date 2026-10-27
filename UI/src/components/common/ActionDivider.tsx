import { Divider } from "@mui/material";
import {
  actionDividerSx,
} from "@/styles/common";

/** Consistent vertical separator for compact table action groups. */
export default function ActionDivider() {
  return <Divider orientation="vertical" flexItem sx={actionDividerSx} />;
}
