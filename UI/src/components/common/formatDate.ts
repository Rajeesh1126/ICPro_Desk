/**
 * Date display helpers used across tables, cards and dialogs.
 * They delegate to `utils/dateRange` so the whole app shows one format:
 * "8 Oct 2026" and "8 Oct 2026, 14:22". Empty or invalid values render
 * as "—" (never as the current date).
 */
export { formatDate, formatDateTime } from "../../utils/dateRange";
