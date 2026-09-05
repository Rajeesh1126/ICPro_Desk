import { useEffect, useMemo, useState } from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";
import {
  VirtualizedTable,
  type ColumnData,
} from "../components/common/TableView";
import api from "../api/axios";
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
  [key: string]: unknown;
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
  const [quotations, setQuotations] = useState<QuotationBudgetSummary[]>([]);

  useEffect(() => {
    let active = true;

    void api
      .get<QuotationBudgetSummary[]>("/erp/quotations/budget-summary/")
      .then((response) => {
        if (!active) return;
        setQuotations(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (!active) return;
        setQuotations([]);
      });

    return () => {
      active = false;
    };
  }, []);

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
    const utilization =
      totalBudgetHours > 0
        ? (totalActualHours / totalBudgetHours) * 100
        : 0;

    return [
      {
        label: "Quotations",
        value: String(quotations.length),
        helper: "Latest quotation numbers",
      },
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

          return (
            <Chip
              size="small"
              label={status}
              color={status === "Over Budget" ? "error" : "success"}
              variant={status === "Over Budget" ? "filled" : "outlined"}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <Box sx={page}>
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" sx={pageTitle}>Budget Summary</Typography>
          </Box>
        </Box>

        <Box sx={summaryMetricGrid}>
          {summary.map((metric) => (
            <Paper
              key={metric.label}
              elevation={0}
              sx={summaryMetricCard}
            >
              <Typography sx={summaryMetricLabel}>
                {metric.label}
              </Typography>
              <Typography sx={summaryMetricValue}>
                {metric.value}
              </Typography>
              <Typography sx={summaryMetricHelper}>
                {metric.helper}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={contentPanel}>
          <VirtualizedTable<QuotationBudgetSummary>
            columns={columns}
            rows={quotations}
            height="100%"
            tableHead="Latest 20 Quotations"
          />
        </Box>
      </Box>
    </Box>
  );
}
