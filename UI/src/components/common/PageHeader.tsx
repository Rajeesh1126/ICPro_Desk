import { Fragment, useId, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
  type SxProps,
  type Theme,
} from "@mui/material";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import {
  pageHeader,
  pageHeaderActions,
  pageHeaderCompact,
  pageHeaderCompactActions,
  pageHeaderCompactExtra,
  pageHeaderCompactRow,
  pageHeaderCompactSubtitle,
  pageHeaderCompactTitle,
  pageHeaderContent,
  pageHeaderMenuCheck,
  pageHeaderMenuPaper,
  pageHeaderMenuSection,
  pageHeaderMoreButton,
  pageSubtitle,
  pageTitle,
} from "@/styles/layout";

/** Header layout tiers: desktop is the original layout, untouched. */
const TABLET_DOWN = "(max-width:1200px)";
const MOBILE_DOWN = "(max-width:600px)";

/**
 * Where an action sits on a tier: in the header ("inline"), in the "more"
 * menu ("menu"), on its own full-width row under the title ("row"), or not
 * in the header at all ("hidden", when the page offers it elsewhere).
 */
export type PageHeaderPlacement = "inline" | "menu" | "row" | "hidden";

/**
 * - high: always in the header (compact form on phones).
 * - medium: in the header down to tablets, in the menu on phones.
 * - low: in the menu below desktop.
 */
export type PageHeaderPriority = "high" | "medium" | "low";

export interface PageHeaderMenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** Marks the current choice of a segmented control shown as menu items. */
  selected?: boolean;
}

export interface PageHeaderAction {
  key: string;
  /** The control as shown on desktop. */
  node: ReactNode;
  /** Smaller form for tablets (e.g. an icon-only view switch). */
  tabletNode?: ReactNode;
  /** Smaller form for phones (icon-only or short label). */
  mobileNode?: ReactNode;
  priority?: PageHeaderPriority;
  /** Overrides the priority's placement, e.g. for a select that cannot be a menu item. */
  tablet?: PageHeaderPlacement;
  mobile?: PageHeaderPlacement;
  /** Heading for this action's entries in the "more" menu. */
  menuLabel?: string;
  /** Entries used when the action is in the "more" menu. */
  menuItems?: PageHeaderMenuItem[];
}

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Falsy entries are skipped, so pages can write `canAdd && {...}`. */
  actions?: (PageHeaderAction | false | null | undefined)[];
  /** Extra content under the title block, e.g. a notice. */
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

const PLACEMENT: Record<PageHeaderPriority, { tablet: PageHeaderPlacement; mobile: PageHeaderPlacement }> = {
  high: { tablet: "inline", mobile: "inline" },
  medium: { tablet: "inline", mobile: "menu" },
  low: { tablet: "menu", mobile: "menu" },
};

/**
 * Page title, description and page-level actions.
 *
 * Above 1200px this is the original two-column header. Up to 1200px the
 * actions stay on the title's row by priority, lower-priority ones move into
 * a horizontal "more" menu, and the description spans the width below, so
 * the header never turns into a tall stacked column.
 */
export default function PageHeader({
  title,
  subtitle,
  actions = [],
  children,
  sx,
}: PageHeaderProps) {
  const isTablet = useMediaQuery(TABLET_DOWN, { noSsr: true });
  const isMobile = useMediaQuery(MOBILE_DOWN, { noSsr: true });
  const list = actions.filter(Boolean) as PageHeaderAction[];

  const titleNode = (
    <Typography variant="h5" component="h1" sx={[pageTitle, !isTablet ? {} : pageHeaderCompactTitle]}>
      {title}
    </Typography>
  );

  if (!isTablet) {
    return (
      <Box sx={[pageHeader, { flexShrink: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
        <Box sx={pageHeaderContent}>
          {titleNode}
          {subtitle && (
            <Typography variant="body2" sx={pageSubtitle}>
              {subtitle}
            </Typography>
          )}
          {children}
        </Box>
        {list.length > 0 && (
          <Box sx={pageHeaderActions}>
            {list.map((action) => (
              <Fragment key={action.key}>{action.node}</Fragment>
            ))}
          </Box>
        )}
      </Box>
    );
  }

  const tier = isMobile ? "mobile" : "tablet";
  const placementOf = (action: PageHeaderAction) => {
    const placement = action[tier] ?? PLACEMENT[action.priority ?? "high"][tier];
    // An action without menu entries can only be shown in the header.
    return placement === "menu" && !action.menuItems?.length ? "inline" : placement;
  };
  const nodeOf = (action: PageHeaderAction) =>
    (isMobile ? action.mobileNode ?? action.tabletNode : action.tabletNode) ?? action.node;

  const inline = list.filter((action) => placementOf(action) === "inline");
  const rows = list.filter((action) => placementOf(action) === "row");
  const menu = list.filter((action) => placementOf(action) === "menu");

  return (
    <Box sx={[pageHeaderCompact, ...(Array.isArray(sx) ? sx : [sx])]}>
      {titleNode}
      {(inline.length > 0 || menu.length > 0) && (
        <Box sx={pageHeaderCompactActions}>
          {inline.map((action) => (
            <Fragment key={action.key}>{nodeOf(action)}</Fragment>
          ))}
          {menu.length > 0 && <PageHeaderMoreMenu actions={menu} />}
        </Box>
      )}
      {subtitle && (
        <Typography variant="body2" sx={[pageSubtitle, pageHeaderCompactSubtitle]}>
          {subtitle}
        </Typography>
      )}
      {rows.length > 0 && (
        <Box sx={pageHeaderCompactRow}>
          {rows.map((action) => (
            <Fragment key={action.key}>{nodeOf(action)}</Fragment>
          ))}
        </Box>
      )}
      {children && <Box sx={pageHeaderCompactExtra}>{children}</Box>}
    </Box>
  );
}

function PageHeaderMoreMenu({ actions }: { actions: PageHeaderAction[] }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuId = useId();
  const close = () => setAnchorEl(null);
  // Close first, then act: a dialog opened over an open menu traps focus.
  const run = (onClick: () => void) => () => {
    close();
    onClick();
  };

  return (
    <>
      <Tooltip title="More actions">
        <Button
          variant="outlined"
          aria-label="More actions"
          aria-haspopup="menu"
          aria-expanded={anchorEl ? "true" : undefined}
          aria-controls={anchorEl ? menuId : undefined}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={pageHeaderMoreButton}
        >
          <MoreHorizOutlinedIcon />
        </Button>
      </Tooltip>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        variant="menu"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: pageHeaderMenuPaper } }}
      >
        {actions.flatMap((action, index) => {
          const isChoice = action.menuItems!.some((item) => item.selected !== undefined);
          return [
            index > 0 && <Divider key={`${action.key}-divider`} />,
            action.menuLabel && (
              <ListSubheader key={`${action.key}-label`} sx={pageHeaderMenuSection}>
                {action.menuLabel}
              </ListSubheader>
            ),
            ...action.menuItems!.map((item) => (
              <MenuItem
                key={`${action.key}-${item.key}`}
                onClick={run(item.onClick)}
                disabled={item.disabled}
                selected={item.selected}
                role={isChoice ? "menuitemradio" : "menuitem"}
                aria-checked={isChoice ? Boolean(item.selected) : undefined}
              >
                {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                <ListItemText>{item.label}</ListItemText>
                {item.selected && <CheckOutlinedIcon sx={pageHeaderMenuCheck} />}
              </MenuItem>
            )),
          ].filter(Boolean);
        })}
      </Menu>
    </>
  );
}
