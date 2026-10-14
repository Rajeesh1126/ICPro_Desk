import { useMemo } from "react";
import { Box, Chip, Paper, Skeleton, Tooltip, Typography } from "@mui/material";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import {
  VirtualizedTable,
  type ColumnData,
} from "../components/common/TableView";
import { asArray, useApiQuery } from "../api/useApiQuery";
import {
  contentPanel,
  page,
  pageContent,
  pageHeaderContent,
  pageHeader,
  pageTitle,
  summaryMetricCard,
  summaryMetricGrid,
  summaryMetricHelper,
  summaryMetricLabel,
  summaryMetricValue,
} from "../styles/common";

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

type SummaryMetric = {
  label: string;
  value: string;
  helper: string;
};

const formatHours = (value: number) => value.toFixed(2);

const budgetStatus = (row: QuotationBudgetSummary) =>
  row.actual_hours > row.budget_hours ? "Over Budget" : "Under Budget";

export default function Landing() {
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
    const totalVarianceHours = totalActualHours - totalBudgetHours;
    const utilization =
      totalBudgetHours > 0
        ? (totalActualHours / totalBudgetHours) * 100
        : 0;

    return [
      {
        label: "Budget Hours",
        value: formatHours(totalBudgetHours),
        helper: "Quantity x 9 hours",
      },
      {
        label: "Actual Hours",
        value: formatHours(totalActualHours),
        helper: `${utilization.toFixed(2)}% utilized`,
      },
      {
        label: "Variance (hrs)",
        value: formatHours(totalVarianceHours),
        helper:
          totalVarianceHours > 0
            ? "Actual hours exceed budget"
            : "Within the total budget",
      },
      {
        label: "Over Budget",
        value: String(overBudgetCount),
        helper: `${quotations.length - overBudgetCount} under budget`,
      },
    ];
  }, [quotations]);

  const columns = useMemo<ColumnData<QuotationBudgetSummary>[]>(
    () => [
      {
        label: "Quotation No",
        dataKey: "quotation_no",
        width: 180,
      },
      {
        label: "Subject",
        dataKey: "covering_letter_subject",
        width: 250,
      },
      {
        label: "Customer",
        dataKey: "customer_name",
        width: 180,
      },
      {
        label: "Status",
        dataKey: "status",
        width: 110,
      },
      {
        label: "Budget Hrs",
        dataKey: "budget_hours",
        width: 100,
        numeric: true,
        render: (row) => formatHours(row.budget_hours),
      },
      {
        label: "Actual Hrs",
        dataKey: "actual_hours",
        width: 100,
        numeric: true,
        render: (row) => formatHours(row.actual_hours),
      },
      {
        label: "Variance",
        dataKey: "variance_hours",
        width: 100,
        numeric: true,
        render: (row) => formatHours(row.variance_hours),
      },
      {
        label: "Utilization",
        dataKey: "utilization_percent",
        width: 115,
        numeric: true,
        render: (row) => `${row.utilization_percent.toFixed(2)}%`,
      },
      {
        label: "Budget Status",
        width: 135,
        render: (row) => {
          const status = budgetStatus(row);
          const over = status === "Over Budget";
          const overBy = row.actual_hours - row.budget_hours;

          return (
            <Chip
              icon={over ? <TrendingUpOutlinedIcon /> : <CheckCircleOutlineOutlinedIcon />}
              label={over ? `Over by ${formatHours(overBy)} h` : "Within budget"}
              color={over ? "error" : "success"}
              variant={over ? "filled" : "outlined"}
              aria-label={over ? `Over budget by ${formatHours(overBy)} hours` : "Within budget"}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" component="h1" sx={pageTitle}>Budget Summary</Typography>
            <Typography variant="body2" color="text.secondary">
              Budgeted versus actual hours for the latest quotations.
            </Typography>
          </Box>
        </Box>

        <Box sx={summaryMetricGrid}>
          {summary.map((metric) => (
            <Paper
              key={metric.label}
              elevation={0}
              sx={summaryMetricCard}
              aria-busy={loading}
            >
              <Typography sx={summaryMetricLabel}>
                {metric.label}
              </Typography>
              {loading ? (
                <>
                  <Skeleton variant="text" width="45%" height={36} />
                  <Skeleton variant="text" width="70%" />
                </>
              ) : (
                <>
                  <Typography sx={summaryMetricValue}>
                    {metric.value}
                  </Typography>
                  {metric.label === "Budget Hours" ? (
                    <Tooltip title="Budget formula: quotation quantity multiplied by nine standard hours.">
                      <Typography sx={summaryMetricHelper}>{metric.helper}</Typography>
                    </Tooltip>
                  ) : (
                    <Typography sx={summaryMetricHelper}>{metric.helper}</Typography>
                  )}
                </>
              )}
            </Paper>
          ))}
        </Box>

        <Box sx={contentPanel}>
          <VirtualizedTable<QuotationBudgetSummary>
            columns={columns}
            rows={quotations}
            height="100%"
            tableHead=""
            loading={loading}
            emptyTitle="No quotations yet"
            emptyDescription="Quotations with budgeted hours will appear here."
          />
        </Box>
      </Box>
    </Box>
  );
}
