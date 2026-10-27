import { Box } from "@mui/material";
import { visuallyHiddenSx } from "@/styles/common";


interface ChartDataTableProps {
  caption: string;
  /** Row header label, e.g. "Status" or "Project". */
  rowHeader: string;
  rows: string[];
  /** One column per series; `values[i]` aligns with `rows[i]`. */
  columns: { label: string; values: (number | string)[] }[];
}

/**
 * The chart's numbers as a real table for screen readers (canvas charts are
 * invisible to assistive tech). Visually hidden; the chart remains the visual.
 */
export default function ChartDataTable({ caption, rowHeader, rows, columns }: ChartDataTableProps) {
  if (!rows.length) return null;
  return (
    <Box component="table" sx={visuallyHiddenSx}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{rowHeader}</th>
          {columns.map((column) => (
            <th key={column.label} scope="col">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row}>
            <th scope="row">{row}</th>
            {columns.map((column) => (
              <td key={column.label}>{column.values[index] ?? 0}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Box>
  );
}

