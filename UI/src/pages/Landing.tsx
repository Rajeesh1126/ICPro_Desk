import { useMemo, useState } from "react";
import SummaryMetrics, {
  type SummaryMetric,
} from "@/components/common/SummaryMetrics";
import { formatDecimalHours } from "@/utils/hoursMinutes";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import DialogHeader from "@/components/common/DialogHeader";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import {
  VirtualizedTable,
  type ColumnData,
} from "@/components/common/TableView";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import {
  contentPanel,
  page,
  pageContent,
  pageHeaderContent,
  pageHeader,
  pageTitle,
  negativeValueSx,
  quietStatusTextSx,
  budgetSubjectButtonSx,
  quotationFactsSx,
  quotationPreviewSx,
  quotationPreviewTitleSx,
  twoLineClampSx,
} from "@/styles/common";

type QuotationBudgetSummary = {
  quotation_id: number;
  quotation_no: string;
  revision_number: number | null;
  covering_letter_subject: string | null;
  customer_name: string | null;
  status: string;
  create_date: string;
  budget_hours: number;
  actual_hours: number;
  variance_hours: number;
  utilization_percent: number;
};

const formatPercent = (value: number) => `${Math.round(value * 10) / 10}%`;
// Keep the existing hours/minutes convention, adding grouping only on Home.
const formatBudgetHours = (value: unknown) =>
  formatDecimalHours(value).replace(/\d+/g, (digits) =>
    Number(digits).toLocaleString("en-US"),
  );
// Summary metrics spell the hour unit out ("30,663 hrs"); table cells keep "h".
const formatMetricHours = (value: unknown) =>
  formatBudgetHours(value).replace(/\bh\b/g, "hrs");

const budgetStatus = (row: QuotationBudgetSummary) =>
  row.actual_hours > row.budget_hours ? "Over Budget" : "Under Budget";

export default function Landing() {
  const [preview, setPreview] = useState<QuotationBudgetSummary | null>(null);
  // Cached: revisiting Home shows the last summary at once and refreshes it
  // in the background once it is older than the cache's stale time.
  const quotationsQuery = useApiQuery<QuotationBudgetSummary[]>(
    "/erp/quotations/budget-summary/",
  );
  const quotations = useMemo(
    () => asArray<QuotationBudgetSummary>(quotationsQuery.data),
    [quotationsQuery.data],
  );
  const loading = quotationsQuery.isPending;

  const summary = useMemo<SummaryMetric[]>(() => {
    const totalBudgetHours = quotations.reduce(
      (total, quotation) => total + Number(quotation.budget_hours || 0),
      0,
    );
    const totalActualHours = quotations.reduce(
      (total, quotation) => total + Number(quotation.actual_hours || 0),
      0,
    );
    const overBudgetCount = quotations.filter(
      (quotation) => quotation.actual_hours > quotation.budget_hours,
    ).length;
    // Same convention as each row's variance: budget − actual, so a positive
    // number is hours still available and a negative one is over budget.
    const totalVarianceHours = totalBudgetHours - totalActualHours;
    const utilization =
      totalBudgetHours > 0 ? (totalActualHours / totalBudgetHours) * 100 : 0;

    return [
      {
        label: "Budget Hours",
        value: formatMetricHours(totalBudgetHours),
        helper: "Quoted quantity × 9 h",
        helperTooltip:
          "Budget formula: quotation quantity multiplied by nine standard hours.",
      },
      {
        label: "Actual Hours",
        value: formatMetricHours(totalActualHours),
        helper:
          totalActualHours === 0
            ? "No actual hours recorded in this summary"
            : totalBudgetHours > 0
              ? `${formatPercent(utilization)} of budget used`
              : "No budget hours allocated",
      },
      {
        label: "Remaining budget hours",
        value: formatMetricHours(totalVarianceHours),
        helper:
          totalVarianceHours < 0
            ? `Over budget by ${formatBudgetHours(Math.abs(totalVarianceHours))}`
            : "Budget minus recorded actual hours",
        tone: totalVarianceHours < 0 ? "error" : undefined,
      },
      {
        label: "Over Budget",
        value: String(overBudgetCount),
        helper: `${quotations.length - overBudgetCount} within budget · based on recorded hours`,
        tone: overBudgetCount > 0 ? "error" : undefined,
      },
    ];
  }, [quotations]);

  const columns = useMemo<ColumnData<QuotationBudgetSummary>[]>(
    () => [
      {
        label: "Quotation No",
        dataKey: "quotation_no",
        width: 160,
      },
      {
        // The main description, so it gets the most room.
        label: "Subject",
        dataKey: "covering_letter_subject",
        width: 360,
        render: (row) => (
          <Button
            variant="text"
            onClick={() => setPreview(row)}
            aria-label={`View quotation ${row.quotation_no}: ${row.covering_letter_subject || "No subject"}`}
            sx={budgetSubjectButtonSx}
          >
            <Box
              component="span"
              sx={twoLineClampSx}
            >
              {row.covering_letter_subject || "No subject — view quotation"}
            </Box>
          </Button>
        ),
      },
      {
        label: "Customer",
        dataKey: "customer_name",
        width: 180,
        wrap: true,
      },
      {
        label: "Status",
        dataKey: "status",
        width: 120,
      },
      {
        label: "Budget Hrs",
        dataKey: "budget_hours",
        width: 100,
        numeric: true,
        render: (row) => formatBudgetHours(row.budget_hours),
      },
      {
        label: "Actual Hrs",
        dataKey: "actual_hours",
        width: 100,
        numeric: true,
        render: (row) => formatBudgetHours(row.actual_hours),
      },
      {
        label: "Remaining Hrs",
        dataKey: "variance_hours",
        width: 125,
        numeric: true,
        render: (row) => (
          <Box component="span" sx={negativeValueSx(row.variance_hours < 0)}>
            {formatBudgetHours(row.variance_hours)}
          </Box>
        ),
      },
      {
        label: "Utilization",
        dataKey: "utilization_percent",
        width: 120,
        numeric: true,
        render: (row) => formatPercent(row.utilization_percent),
      },
      {
        label: "Budget Status",
        width: 145,
        render: (row) => {
          // Only the exception gets a chip; the usual case stays quiet so
          // over-budget rows stand out.
          if (budgetStatus(row) !== "Over Budget") {
            return (
              <Typography sx={quietStatusTextSx}>Within budget</Typography>
            );
          }
          const overBy = row.actual_hours - row.budget_hours;
          return (
            <Chip
              icon={<TrendingUpOutlinedIcon />}
              label={`Over by ${formatBudgetHours(overBy)}`}
              color="error"
              variant="filled"
              aria-label={`Over budget by ${formatBudgetHours(overBy)}`}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <Box sx={[page, { fontVariantNumeric: "tabular-nums" }]}>
      <Box sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" component="h1" sx={pageTitle}>
              Budget Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Budgeted versus actual hours for the latest quotations.
            </Typography>
          </Box>
        </Box>

        <SummaryMetrics metrics={summary} loading={loading} />

        <Box
          sx={[
            contentPanel,
            {
              // Virtuoso gives the sticky thead an inline z-index of 2. Raise the
              // whole header stacking context above the pinned body cells (15);
              // raising only the corner th cannot escape its parent's context.
              "& .MuiTableHead-root": { zIndex: "31 !important" },
              "& .MuiTableSortLabel-root:not(.Mui-active) .MuiTableSortLabel-icon":
                { opacity: 0 },
              "& .MuiTableSortLabel-root:not(.Mui-active):hover .MuiTableSortLabel-icon, & .MuiTableSortLabel-root:not(.Mui-active):focus-visible .MuiTableSortLabel-icon":
                { opacity: 0.5 },
              "& .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon": {
                opacity: 1,
              },
            },
          ]}
        >
          <VirtualizedTable<QuotationBudgetSummary>
            columns={columns}
            rows={quotations}
            height="100%"
            tableHead="Quotations"
            tableHeadSub="Select a subject to read the full quotation and budget details."
            stickyFirstColumn
            loading={loading}
            emptyTitle="No quotations yet"
            emptyDescription="Quotations with budgeted hours will appear here."
          />
        </Box>
      </Box>
      <Dialog
        open={preview !== null}
        onClose={() => setPreview(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="quotation-preview-title"
      >
        <DialogHeader
          id="quotation-preview-title"
          title={preview?.quotation_no || "Quotation details"}
          subtitle="Quotation budget details"
          onClose={() => setPreview(null)}
        />
        <DialogContent>
          {preview && (
            <Box sx={quotationPreviewSx}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Subject
                </Typography>
                <Typography sx={quotationPreviewTitleSx}>
                  {preview.covering_letter_subject || "No subject provided"}
                </Typography>
              </Box>
              <Box
                component="dl"
                sx={quotationFactsSx}
              >
                {[
                  ["Customer", preview.customer_name || "Not provided"],
                  ["Status", preview.status],
                  ["Budget hours", formatBudgetHours(preview.budget_hours)],
                  ["Actual hours", formatBudgetHours(preview.actual_hours)],
                  [
                    "Remaining budget hours",
                    formatBudgetHours(preview.variance_hours),
                  ],
                  ["Utilization", formatPercent(preview.utilization_percent)],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </Box>
                ))}
              </Box>
              <Typography
                variant="body2"
                color={
                  preview.variance_hours < 0 ? "error.main" : "text.secondary"
                }
              >
                {preview.variance_hours < 0
                  ? `Over budget by ${formatBudgetHours(Math.abs(preview.variance_hours))}.`
                  : "Remaining budget = budget hours minus recorded actual hours."}
                {Number(preview.actual_hours) === 0 &&
                  " No actual hours are recorded for this quotation; this does not confirm that no work has taken place."}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
