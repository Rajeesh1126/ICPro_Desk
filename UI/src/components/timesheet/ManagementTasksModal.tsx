import { useMemo, useState } from "react";
import {
  Alert, Box, Button, Checkbox, CircularProgress, Collapse, Dialog, DialogActions,
  DialogContent, IconButton, Stack, Typography,
} from "@mui/material";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import DialogHeader from "@/components/common/DialogHeader";
import { useDiscardGuard } from "@/components/common/useDiscardGuard";
import { RotatingChevron } from "@/animations/MotionPrimitives";
import {
  assignTaskContentSx,
  assignTaskLoadingSx,
  assignTaskMilestoneListSx,
  assignTaskNestedListSx,
  assignTaskToolbarSx,
  assignTaskTreeSx,
} from "@/styles/common";

export type ManagementTask = {
  id: number;
  name: string;
  description: string | null;
  milestone_id: number | null;
  milestone_name: string;
};
export type ManagementTaskOptions = {
  project: { id: number; code: string; description: string | null };
  tasks: ManagementTask[];
};
interface ManagementTasksModalProps {
  data?: ManagementTaskOptions;
  loading: boolean;
  error: boolean;
  submitting: boolean;
  assignmentError?: string;
  onClose: () => void;
  onRetry: () => void;
  onSubmit: (taskIds: number[]) => void | Promise<void>;
}

/** Expandable project and milestone branches with independent task selection. */
export default function ManagementTasksModal({
  data, loading, error, submitting, assignmentError, onClose, onRetry, onSubmit,
}: ManagementTasksModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [projectExpanded, setProjectExpanded] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const discard = useDiscardGuard(true, onClose, selectedIds.length > 0);
  const close = () => { if (!submitting) discard.requestClose(); };
  const tasks = useMemo(() => error || !Array.isArray(data?.tasks) ? [] : data.tasks, [data, error]);
  const selected = selectedIds.filter((id) => tasks.some((task) => task.id === id));
  const projectLabel = `${data?.project?.code ?? "ICP/GM/001"} - ${data?.project?.description ?? "Management Jobs"}`;
  const groups = new Map<string, { name: string; tasks: ManagementTask[] }>();
  for (const task of tasks) {
    const key = String(task.milestone_id ?? "general");
    if (!groups.has(key)) groups.set(key, { name: task.milestone_name || "General", tasks: [] });
    groups.get(key)!.tasks.push(task);
  }
  const toggleTasks = (ids: number[]) => {
    if (submitting) return;
    setSelectedIds((current) => ids.every((id) => current.includes(id))
      ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])]);
  };
  const selectionCheckbox = (ids: number[], label: string) => {
    const count = ids.filter((id) => selectedIds.includes(id)).length;
    return (
      <Checkbox
        checked={ids.length > 0 && count === ids.length}
        indeterminate={count > 0 && count < ids.length}
        disabled={submitting || !ids.length}
        inputProps={{ "aria-label": label }}
        onChange={() => toggleTasks(ids)}
      />
    );
  };

  return (
    <Dialog open fullWidth maxWidth="lg" onClose={close} aria-labelledby="management-tasks-title">
      <DialogHeader id="management-tasks-title" title="Select management tasks" onClose={close} closeDisabled={submitting} />
      <DialogContent sx={assignTaskContentSx(!error && tasks.length > 0)}>
        {assignmentError && <Alert severity="error" sx={{ mb: 2 }}>{assignmentError}</Alert>}
        {error ? (
          <Alert severity="error" action={<Button onClick={onRetry}>Retry</Button>}>
            Could not load management tasks. Please try again.
          </Alert>
        ) : loading && !tasks.length ? (
          <Stack role="status" alignItems="center" justifyContent="center" spacing={1.5} sx={assignTaskLoadingSx}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">Loading management tasks…</Typography>
          </Stack>
        ) : !tasks.length ? (
          <Alert severity="info">No management tasks available. Add tasks to the Management Jobs project first.</Alert>
        ) : (
          <Box role="group" aria-label="Management task selection" sx={assignTaskTreeSx}>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={assignTaskToolbarSx}>
              <IconButton aria-label={`${projectExpanded ? "Collapse" : "Expand"} management project`}
                aria-expanded={projectExpanded} onClick={() => setProjectExpanded((value) => !value)}>
                <RotatingChevron open={projectExpanded}><ExpandMoreOutlinedIcon /></RotatingChevron>
              </IconButton>
              {selectionCheckbox(tasks.map((task) => task.id), "Select all management tasks")}
              <AssignmentOutlinedIcon fontSize="small" color="action" />
              <Typography fontWeight={600}>{projectLabel}</Typography>
            </Stack>
            <Collapse in={projectExpanded} timeout="auto" unmountOnExit>
              <Stack spacing={0.5} sx={assignTaskMilestoneListSx}>
                {[...groups].map(([key, group]) => {
                  const expanded = !collapsed.has(key);
                  return (
                    <Box key={key}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <IconButton aria-label={`${expanded ? "Collapse" : "Expand"} milestone ${group.name}`}
                          aria-expanded={expanded} onClick={() => setCollapsed((current) => {
                            const next = new Set(current);
                            if (next.has(key)) next.delete(key); else next.add(key);
                            return next;
                          })}>
                          <RotatingChevron open={expanded}><ExpandMoreOutlinedIcon /></RotatingChevron>
                        </IconButton>
                        {selectionCheckbox(group.tasks.map((task) => task.id), `Select milestone ${group.name}`)}
                        <Typography variant="body2" fontWeight={600}>{group.name}</Typography>
                      </Stack>
                      <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Stack sx={assignTaskNestedListSx}>
                          {group.tasks.map((task) => (
                            <Stack key={task.id} component="label" direction="row" alignItems="center" spacing={0.5}
                              sx={{ cursor: submitting ? "default" : "pointer" }}>
                              {selectionCheckbox([task.id], `Select task ${task.name}`)}
                              <Typography variant="body2" color="text.secondary">
                                {task.name}
                                {task.description && (
                                  <Typography component="span" variant="caption" color="text.secondary"
                                    sx={{ display: "block" }}>
                                    {task.description}
                                  </Typography>
                                )}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Collapse>
                    </Box>
                  );
                })}
              </Stack>
            </Collapse>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap" }}>
        <Button onClick={close} disabled={submitting}>Cancel</Button>
        <Button variant="contained" startIcon={<AssignmentTurnedInOutlinedIcon />}
          disabled={loading || error || submitting || !selected.length} onClick={() => void onSubmit(selected)}>
          {submitting ? "Assigning..." : `Assign Selected (${selected.length})`}
        </Button>
      </DialogActions>
      {discard.dialog}
    </Dialog>
  );
}
