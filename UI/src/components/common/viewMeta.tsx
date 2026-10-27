import type { ReactNode } from "react";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

/** Views every work-item page has. */
export type BaseView = "table" | "card";
/** All views; "calendar" is a capability only the Tickets page opts into. */
export type PageView = BaseView | "calendar";

export const VIEW_META: Record<PageView, { label: string; icon: ReactNode }> = {
  table: { label: "List", icon: <TableRowsOutlinedIcon /> },
  card: { label: "Board", icon: <ViewKanbanOutlinedIcon /> },
  calendar: { label: "Calendar", icon: <CalendarMonthOutlinedIcon /> },
};
