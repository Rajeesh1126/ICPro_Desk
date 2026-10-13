import type { RefCallback } from "react";
import { Badge, Button, CircularProgress } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";

interface ReportHeaderActionsProps {
  onExport?: () => void;
  exportDisabled?: boolean;
  exporting?: boolean;
  onFilter: () => void;
  filterButtonRef?: RefCallback<HTMLButtonElement>;
  activeFilterCount?: number;
}

/**
 * Keeps report headers consistent: Excel export first as the secondary action,
 * followed by the primary Filters action.
 */
export default function ReportHeaderActions({
  onExport,
  exportDisabled = false,
  exporting = false,
  onFilter,
  filterButtonRef,
  activeFilterCount = 0,
}: ReportHeaderActionsProps) {
  return (
    <>
      {onExport && (
        <Button
          variant="outlined"
          startIcon={
            exporting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DownloadOutlinedIcon />
            )
          }
          onClick={onExport}
          disabled={exportDisabled || exporting}
          aria-busy={exporting}
        >
          {exporting ? "Exporting…" : "Export Excel"}
        </Button>
      )}
      <Button
        variant="contained"
        startIcon={
          activeFilterCount > 0 ? (
            <Badge badgeContent={activeFilterCount} color="primary">
              <FilterListOutlinedIcon fontSize="small" />
            </Badge>
          ) : (
            <FilterListOutlinedIcon />
          )
        }
        ref={filterButtonRef}
        onClick={onFilter}
      >
        Filters
      </Button>
    </>
  );
}
