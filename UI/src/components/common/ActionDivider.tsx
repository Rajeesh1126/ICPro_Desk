import { Children, Fragment, type ReactNode } from "react";
import { Divider, Stack } from "@mui/material";
import {
  actionDividerSx,
} from "@/styles/common";

/** Consistent vertical separator for compact table action groups. */
export default function ActionDivider() {
  return <Divider orientation="vertical" flexItem sx={actionDividerSx} />;
}

/**
 * Renders the visible table actions and inserts one divider between each.
 * Empty permission-based children are removed before separators are added.
 */
export function TableActionGroup({ children }: { children: ReactNode }) {
  const actions = Children.toArray(children);

  return (
    <Stack
      direction="row"
      spacing={0}
      alignItems="center"
      justifyContent="center"
    >
      {actions.map((action, index) => (
        <Fragment key={index}>
          {index > 0 && <ActionDivider />}
          {action}
        </Fragment>
      ))}
    </Stack>
  );
}
