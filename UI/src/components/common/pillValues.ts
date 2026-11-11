import { formatStatusLabel, getStatusColor } from "@/styles/common";

/*
 * Value helpers for <Pill>. Columns and cards call these to turn an API
 * value into the pill's text and colour, and can pass anything else instead.
 */

/** Colour of a workflow status ("open", "submitted", …) from STATUS_COLORS. */
export const statusColor = (status: unknown) => getStatusColor(status);

/** Readable status text: "in-progress" → "In progress", dates formatted. */
export const statusLabel = (status: unknown) => {
  const text = formatStatusLabel(status);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
};

/** Theme colour key for a priority: high → error, medium → warning, else success. */
export const priorityColor = (priority: unknown) => {
  const value = String(priority ?? "").trim().toLowerCase();
  if (value === "high") return "error";
  if (value === "medium") return "warning";
  return "success";
};

/** Priority text in sentence case ("HIGH" → "High"). */
export const priorityLabel = (priority: unknown) => {
  const text = String(priority ?? "").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "";
};

/** Quiet grey for tags with no state meaning (roles, teams, "Pending"). */
export const neutralColor = getStatusColor("");
