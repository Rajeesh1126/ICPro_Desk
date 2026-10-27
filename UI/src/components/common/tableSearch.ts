import { isValidElement, type ReactNode } from "react";
import { formatIfDate } from "@/utils/dateRange";

type SearchableColumn<T> = {
  dataKey?: keyof T;
  render?: (row: T, index: number) => ReactNode;
  searchValue?: (row: T, index: number) => unknown;
};

const reactNodeSearchText = (node: ReactNode): string => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(reactNodeSearchText).join(" ");
  if (!isValidElement(node)) return "";

  const props = node.props as Record<string, unknown>;
  return [props.children, props.label, props.value, props.status, props.title, props["aria-label"]]
    .map((value) =>
      typeof value === "string" || typeof value === "number"
        ? String(value)
        : reactNodeSearchText(value as ReactNode),
    )
    .filter(Boolean)
    .join(" ");
};

const dataValueSearchText = (value: unknown): string => {
  if (value == null || typeof value === "boolean") return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value instanceof Date) return String(value);
  if (Array.isArray(value)) return value.map(dataValueSearchText).join(" ");
  if (typeof value === "object") return Object.values(value).map(dataValueSearchText).join(" ");
  return "";
};

/** Text represented by a column, including render-only columns. */
export const getColumnSearchText = <T extends object>(
  column: SearchableColumn<T>,
  row: T,
  index: number,
) => {
  const dataValue = column.dataKey ? row[column.dataKey] : undefined;
  const customValue = column.searchValue?.(row, index);
  const renderedValue = column.render?.(row, index);
  return [dataValue, formatIfDate(dataValue), customValue]
    .map(dataValueSearchText)
    .concat(reactNodeSearchText(renderedValue))
    .filter(Boolean)
    .join(" ");
};
