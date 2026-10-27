import { useMemo, useState } from "react";
import api from "@/api/axios";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { showNotification } from "@/api/notificationService";
import ERPQuotationModal from "@/components/timesheet/ERPQuotationModal";
import CreateUndefinedModal from "@/components/timesheet/CreateUndefinedModal";
import TimeSheetTicketsModal, {
  type TimeSheetTicketOption,
} from "@/components/timesheet/TimeSheetTicketsModal";
import AssignCostMasterTasksModal, {
  type TimeSheetCostCategory,
  type TimeSheetCostMaster,
  type TimeSheetPhaseMapping,
} from "@/components/timesheet/AssignCostMasterTasksModal";
import type { ERPQuotation, SubmissionProject } from "@/types/dataTypes";
import type { AddWorkKind } from "@/pages/timesheet/sheet/TimesheetActionsMenu";

type CreatedProjectResponse = { id?: number };

interface AddWorkDialogsProps {
  /** Which dialog is open, if any. */
  open: AddWorkKind | null;
  onClose: () => void;
  weekStartKey: string;
  /** Week is locked: refuse and explain instead of saving. */
  actionsDisabled: boolean;
  onLocked: () => void;
  /** Something was added; the page refreshes the grid. */
  onChanged: () => void;
}

const quotationDescription = (quotation: ERPQuotation) =>
  quotation.custom_project_name ||
  quotation.system_name ||
  quotation.project__name ||
  quotation.quotation_no;

/**
 * The four "Add work" dialogs of the Time Sheet. Their option lists load
 * through the shared cache only while the dialog is open.
 */
export default function AddWorkDialogs({
  open,
  onClose,
  weekStartKey,
  actionsDisabled,
  onLocked,
  onChanged,
}: AddWorkDialogsProps) {
  const [submitting, setSubmitting] = useState(false);

  // ---- Option lists (fetched on open, cached) ----------------------------------
  const quotationsQuery = useApiQuery<ERPQuotation[]>("/erp/quotations/", undefined, {
    enabled: open === "quotation",
  });
  const ticketsQuery = useApiQuery<TimeSheetTicketOption[]>(
    "/timesheet-entries/ticket-options/",
    undefined,
    { enabled: open === "tickets" },
  );
  const costMasterOpen = open === "costMaster";
  const weekProjectsQuery = useApiQuery<SubmissionProject[]>(
    "/timesheet-entries/",
    { week_start: weekStartKey },
    { enabled: costMasterOpen },
  );
  const weekProjects = useMemo(
    () =>
      asArray<SubmissionProject>(weekProjectsQuery.data).filter(
        (project) => project.code !== "Others",
      ),
    [weekProjectsQuery.data],
  );

  const phasesQuery = useApiQuery<TimeSheetPhaseMapping[]>("/phases/", undefined, { enabled: costMasterOpen });
  const categoriesQuery = useApiQuery<TimeSheetCostCategory[]>("/erp/cost-categories/", undefined, {
    enabled: costMasterOpen,
  });
  const costMastersQuery = useApiQuery<TimeSheetCostMaster[]>("/erp/cost-masters/", undefined, {
    enabled: costMasterOpen,
  });
  const costMasterQueries = [weekProjectsQuery, phasesQuery, categoriesQuery, costMastersQuery];
  const costMasterError = costMasterQueries.some((query) => query.isError)
    ? "Could not load assigned projects or mapped cost master items."
    : "";

  const quotations = useMemo(() => asArray<ERPQuotation>(quotationsQuery.data), [quotationsQuery.data]);
  const tickets = useMemo(
    () => asArray<TimeSheetTicketOption>(ticketsQuery.data),
    [ticketsQuery.data],
  );

  // ---- Submit helpers ------------------------------------------------------------
  /** Locked-week guard + spinner + success toast shared by every dialog. */
  const submit = async (work: () => Promise<unknown>, successMessage: string) => {
    if (actionsDisabled) {
      onLocked();
      onClose();
      return;
    }
    setSubmitting(true);
    try {
      await work();
      showNotification({ type: "success", message: successMessage });
      onClose();
      onChanged();
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setSubmitting(false);
    }
  };

  const assignQuotations = (selected: ERPQuotation[]) =>
    submit(
      () =>
        Promise.all(
          selected.map((quotation) =>
            api.post("/projects/", {
              quotation_id: quotation.id,
              code: quotation.quotation_no,
              description: quotationDescription(quotation),
              week_start: weekStartKey,
            }),
          ),
        ),
      "ERP quotation tasks assigned successfully.",
    );

  const createUndefinedJob = (data: { description: string; customerName: string; jobNumber: string }) => {
    const description = data.jobNumber.trim()
      ? `${data.description.trim()} - ${data.jobNumber.trim()}`
      : data.description.trim();
    return submit(async () => {
      const response = await api.post<CreatedProjectResponse>("/projects/", {
        description,
        customer: data.customerName.trim() || null,
        week_start: weekStartKey,
      });
      if (response.data?.id) {
        await api.post("/timesheet-entries/assign-project/", { project_id: response.data.id });
      }
    }, "Undefined job created successfully.");
  };

  const assignTickets = (ticketIds: number[]) =>
    submit(
      () => api.post("/timesheet-entries/assign-tickets/", { ticket_ids: ticketIds }),
      "Selected tickets assigned to timesheet successfully.",
    );

  const assignCostMasterTasks = (selection: Record<number, number[]>) =>
    submit(
      () =>
        Promise.all(
          Object.entries(selection).map(([projectId, costMasterIds]) =>
            api.post(`/projects/${projectId}/cost-master-tasks/`, {
              cost_master_ids: costMasterIds,
              week_start: weekStartKey,
            }),
          ),
        ),
      "Selected cost master tasks assigned successfully.",
    );

  return (
    <>
      <ERPQuotationModal
        open={open === "quotation"}
        onClose={onClose}
        quotations={quotations}
        loading={quotationsQuery.isFetching && !quotations.length}
        submitting={submitting}
        onSelect={(selected) => void assignQuotations(selected)}
      />
      <CreateUndefinedModal
        open={open === "undefined"}
        onClose={onClose}
        submitting={submitting}
        onSubmit={createUndefinedJob}
      />
      <TimeSheetTicketsModal
        open={open === "tickets"}
        tickets={tickets}
        loading={ticketsQuery.isFetching}
        submitting={submitting}
        onClose={onClose}
        onSubmit={assignTickets}
      />
      <AssignCostMasterTasksModal
        open={costMasterOpen}
        projects={costMasterError ? [] : weekProjects}
        phases={costMasterError ? [] : asArray<TimeSheetPhaseMapping>(phasesQuery.data)}
        costCategories={costMasterError ? [] : asArray<TimeSheetCostCategory>(categoriesQuery.data)}
        costMasters={costMasterError ? [] : asArray<TimeSheetCostMaster>(costMastersQuery.data)}
        loading={costMasterOpen && costMasterQueries.some((query) => query.isPending)}
        errorMessage={costMasterError}
        submitting={submitting}
        onClose={onClose}
        onSubmit={assignCostMasterTasks}
      />
    </>
  );
}
