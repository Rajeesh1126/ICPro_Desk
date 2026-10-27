import type { RefCallback } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import type { PageHeaderAction } from "@/components/common/PageHeader";
import { ViewToggle } from "@/components/common/TicketPageParts";
import { VIEW_META, type PageView } from "@/components/common/viewMeta";
import { filterButtonCountSx, pageHeaderIconButton } from "@/styles/common";

/* PageHeader action sets shared by several pages. */

interface ReportHeaderActionsOptions {
  onExport?: () => void;
  exportDisabled?: boolean;
  exporting?: boolean;
  onFilter: () => void;
  filterButtonRef?: RefCallback<HTMLButtonElement>;
  activeFilterCount?: number;
}

/**
 * Report headers: Excel export as the secondary action (into the "more" menu
 * below desktop), then the primary Filters action, which stays in the header
 * because its popover anchors to it.
 */
export function reportHeaderActions({
  onExport,
  exportDisabled = false,
  exporting = false,
  onFilter,
  filterButtonRef,
  activeFilterCount = 0,
}: ReportHeaderActionsOptions): PageHeaderAction[] {
  const filterLabel =
    activeFilterCount > 0 ? `Filters, ${activeFilterCount} active` : "Filters";
  const filterCount = activeFilterCount > 0 && (
    <Box component="span" sx={filterButtonCountSx}>
      {activeFilterCount}
    </Box>
  );
  const exportIcon = exporting ? (
    <CircularProgress size={16} color="inherit" />
  ) : (
    <DownloadOutlinedIcon />
  );

  return [
    onExport && {
      key: "export",
      priority: "low",
      node: (
        <Button
          variant="outlined"
          startIcon={exportIcon}
          onClick={onExport}
          disabled={exportDisabled || exporting}
          aria-busy={exporting}
        >
          {exporting ? "Exporting…" : "Export Excel"}
        </Button>
      ),
      menuItems: [
        {
          key: "excel",
          label: exporting ? "Exporting…" : "Export Excel",
          icon: exportIcon,
          onClick: onExport,
          disabled: exportDisabled || exporting,
        },
      ],
    },
    {
      key: "filters",
      priority: "high",
      node: (
        <Button
          variant="contained"
          startIcon={<FilterListOutlinedIcon />}
          ref={filterButtonRef}
          onClick={onFilter}
          aria-label={filterLabel}
        >
          Filters
          {filterCount}
        </Button>
      ),
      mobileNode: (
        <Button
          variant="contained"
          startIcon={<FilterListOutlinedIcon />}
          ref={filterButtonRef}
          onClick={onFilter}
          aria-label={filterLabel}
          sx={pageHeaderIconButton}
        >
          {filterCount}
        </Button>
      ),
    },
  ].filter(Boolean) as PageHeaderAction[];
}

/**
 * Work-item view switch: in the header down to tablets, a "View" choice in
 * the "more" menu on phones.
 */
export function viewToggleAction<V extends PageView>(
  views: readonly V[],
  value: V,
  onChange: (next: V) => void,
): PageHeaderAction {
  return {
    key: "view",
    priority: "medium",
    node: <ViewToggle<V> views={views} value={value} onChange={onChange} />,
    menuLabel: "View",
    menuItems: views.map((view) => ({
      key: view,
      label: VIEW_META[view].label,
      icon: VIEW_META[view].icon,
      onClick: () => onChange(view),
      selected: view === value,
    })),
  };
}
