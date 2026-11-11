/**
 * Shared style primitives.
 *
 * Naming: name a style for what it is, not where it came from —
 * `dialogHeaderSx`, `tableToolbarSx`, `statusCellSx`, `filterPanelSx`. Never
 * use generated names like `fooBoxSx1` for new styles.
 *
 * Nesting: put a rule on the parent only when it is container-wide (table
 * baseline cells, row hover, MUI internal selectors such as
 * `& .MuiOutlinedInput-root`). If a child already gets the same colour,
 * padding or border from its parent, don't repeat it on the child. Keep child
 * rules for real exceptions.
 *
 * Colour: follow the 60/30/10 roles documented in `tokens.ts`.
 *
 * Icons: navigation and toggle icons (sidebar, view toggles, tabs) use the
 * Outlined variant when unselected and the filled variant when selected.
 * Action icons (Save, Close, Edit, Download, Delete, Warning) always use one
 * meaning-first glyph; don't swap them on selection state.
 */
export {
  buttonLabelCompact,
  buttonLabelFull,
  contentPanel,
  filterField,
  page,
  pageContent,
  pageHeader,
  pageHeaderActions,
  pageHeaderContent,
  pageHeaderIconButton,
  pageSubtitle,
  pageTitle,
  scrollableContent,
  tablePageContent,
  tabs,
  tabsContainer,
  wideFilterField,
} from "@/styles/layout";

export { dateFieldSx } from "@/styles/filters";

export * from "@/styles/shared/base";
export * from "@/styles/shared/shell";
export * from "@/styles/shared/primitives";
export * from "@/styles/shared/calendar";
export * from "@/styles/shared/workItems";
export * from "@/styles/shared/charts";
export * from "@/styles/shared/selfTickets";
export * from "@/styles/shared/tables";
export * from "@/styles/shared/tickets";
export * from "@/styles/shared/errorPages";
export * from "@/styles/shared/auth";
export * from "@/styles/shared/dialogs";
export * from "@/styles/shared/teamAnalysis";
export * from "@/styles/shared/icproCalendar";
export * from "@/styles/shared/timesheet";
export * from "@/styles/shared/collapsibleTable";
export * from "@/styles/shared/components";
export * from "@/styles/shared/pages";
