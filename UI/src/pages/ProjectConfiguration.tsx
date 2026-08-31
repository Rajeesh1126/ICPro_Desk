import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import api from "../api/axios";
import { showNotification } from "../api/NotificationService";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { VirtualizedTable, type ColumnData } from "../components/common/TableView";
import {
  modalActionButtonSx,
  modalPrimaryActionButtonSx,
  pageHeaderSx,
} from "../styles/common";

type ProjectConfig = {
  id: number;
  code: string | null;
  description: string | null;
  quotation_id?: number | null;
};

type MilestoneConfig = {
  id: number;
  project: number;
  category: number | null;
  name: string;
};

type TaskConfig = {
  id: number;
  project: number;
  milestone: number | null;
  cost: number | null;
  name: string;
  description: string | null;
};

type DialogMode = "create" | "edit";
type DialogType = "project" | "milestone" | "task";

type ConfigTableRow = Record<string, unknown> & {
  id: number;
  name: string;
  description?: string;
  category?: string | number;
  milestone?: string;
  cost?: string | number;
  actions: null;
  onEdit: () => void;
  onDelete: () => void;
};

const emptyProjectForm = {
  code: "",
  description: "",
};

const emptyMilestoneForm = {
  project: "",
  category: "",
  name: "",
};

const emptyTaskForm = {
  project: "",
  milestone: "",
  cost: "",
  name: "",
  description: "",
};

export default function ProjectConfiguration() {
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const [milestones, setMilestones] = useState<MilestoneConfig[]>([]);
  const [tasks, setTasks] = useState<TaskConfig[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [dialogType, setDialogType] = useState<DialogType | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [milestoneForm, setMilestoneForm] = useState(emptyMilestoneForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: DialogType;
    id: number;
    label: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const visibleMilestones = useMemo(
    () =>
      selectedProjectId === ""
        ? milestones
        : milestones.filter((milestone) => milestone.project === selectedProjectId),
    [milestones, selectedProjectId],
  );

  const visibleTasks = useMemo(
    () =>
      selectedProjectId === ""
        ? tasks
        : tasks.filter((task) => task.project === selectedProjectId),
    [selectedProjectId, tasks],
  );

  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    try {
      const [projectResponse, milestoneResponse, taskResponse] = await Promise.all([
        api.get<ProjectConfig[]>("/projects/"),
        api.get<MilestoneConfig[]>("/milestones/"),
        api.get<TaskConfig[]>("/tasks/"),
      ]);

      const nextProjects = Array.isArray(projectResponse.data) ? projectResponse.data : [];
      setProjects(nextProjects);
      setMilestones(Array.isArray(milestoneResponse.data) ? milestoneResponse.data : []);
      setTasks(Array.isArray(taskResponse.data) ? taskResponse.data : []);

      setSelectedProjectId((current) => {
        if (current && nextProjects.some((project) => project.id === current)) {
          return current;
        }

        return nextProjects[0]?.id ?? "";
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfiguration();
  }, [loadConfiguration]);

  const openProjectDialog = (mode: DialogMode, project?: ProjectConfig) => {
    setDialogType("project");
    setDialogMode(mode);
    setEditingId(project?.id ?? null);
    setProjectForm({
      code: project?.code ?? "",
      description: project?.description ?? "",
    });
  };

  const openMilestoneDialog = (mode: DialogMode, milestone?: MilestoneConfig) => {
    setDialogType("milestone");
    setDialogMode(mode);
    setEditingId(milestone?.id ?? null);
    setMilestoneForm({
      project: String(milestone?.project ?? selectedProjectId ?? ""),
      category: milestone?.category == null ? "" : String(milestone.category),
      name: milestone?.name ?? "",
    });
  };

  const openTaskDialog = (mode: DialogMode, task?: TaskConfig) => {
    const projectId = task?.project ?? selectedProjectId;
    const projectMilestones = milestones.filter((milestone) => milestone.project === projectId);

    setDialogType("task");
    setDialogMode(mode);
    setEditingId(task?.id ?? null);
    setTaskForm({
      project: String(projectId ?? ""),
      milestone: task?.milestone == null ? String(projectMilestones[0]?.id ?? "") : String(task.milestone),
      cost: task?.cost == null ? "" : String(task.cost),
      name: task?.name ?? "",
      description: task?.description ?? "",
    });
  };

  const closeDialog = () => {
    setDialogType(null);
    setEditingId(null);
  };

  const saveProject = async () => {
    const payload = {
      code: projectForm.code.trim(),
      description: projectForm.description.trim() || null,
    };

    if (!payload.code) return;

    if (dialogMode === "edit" && editingId) {
      await api.patch(`/projects/${editingId}/`, payload);
    } else {
      await api.post("/projects/", payload);
    }
  };

  const saveMilestone = async () => {
    const projectId = Number(milestoneForm.project);
    const payload = {
      project: projectId,
      category: milestoneForm.category === "" ? null : Number(milestoneForm.category),
      name: milestoneForm.name.trim(),
    };

    if (!payload.project || !payload.name) return;

    if (dialogMode === "edit" && editingId) {
      await api.patch(`/milestones/${editingId}/`, payload);
    } else {
      await api.post("/milestones/", payload);
    }
  };

  const saveTask = async () => {
    const projectId = Number(taskForm.project);
    const payload = {
      project: projectId,
      milestone: taskForm.milestone === "" ? null : Number(taskForm.milestone),
      cost: taskForm.cost === "" ? null : Number(taskForm.cost),
      name: taskForm.name.trim(),
      description: taskForm.description.trim() || null,
    };

    if (!payload.project || !payload.name) return;

    if (dialogMode === "edit" && editingId) {
      await api.patch(`/tasks/${editingId}/`, payload);
    } else {
      await api.post("/tasks/", payload);
    }
  };

  const saveDialog = async () => {
    if (!dialogType) return;

    setSaving(true);
    try {
      if (dialogType === "project") await saveProject();
      if (dialogType === "milestone") await saveMilestone();
      if (dialogType === "task") await saveTask();

      showNotification({
        type: "success",
        message: "Project configuration saved successfully.",
      });
      closeDialog();
      await loadConfiguration();
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async () => {
    if (!deleteTarget) return;

    const endpointByType = {
      project: "projects",
      milestone: "milestones",
      task: "tasks",
    };

    setDeleting(true);
    try {
      await api.delete(`/${endpointByType[deleteTarget.type]}/${deleteTarget.id}/`);
      showNotification({
        type: "success",
        message: "Project configuration deleted successfully.",
      });
      setDeleteTarget(null);
      await loadConfiguration();
    } finally {
      setDeleting(false);
    }
  };

  const milestoneOptionsForTask = milestones.filter(
    (milestone) => milestone.project === Number(taskForm.project),
  );

  const actionColumn: ColumnData<ConfigTableRow> = {
    label: "Actions",
    width: 110,
    render: (row) => (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        <IconButton size="small" aria-label={`Edit ${row.name}`} onClick={row.onEdit}>
          <EditRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" aria-label={`Delete ${row.name}`} onClick={row.onDelete}>
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  };

  const projectColumns: ColumnData<ConfigTableRow>[] = [
    { label: "Code", dataKey: "name" },
    { label: "Description", dataKey: "description" },
    actionColumn,
  ];

  const milestoneColumns: ColumnData<ConfigTableRow>[] = [
    { label: "Name", dataKey: "name" },
    { label: "Category", dataKey: "category" },
    actionColumn,
  ];

  const taskColumns: ColumnData<ConfigTableRow>[] = [
    { label: "Name", dataKey: "name" },
    { label: "Milestone", dataKey: "milestone" },
    { label: "Cost", dataKey: "cost", numeric: true },
    { label: "Description", dataKey: "description" },
    actionColumn,
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={pageHeaderSx}>
        <Box>
          <Typography variant="h5">Project Configuration</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure projects, milestones, and tasks without assigning users.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => openProjectDialog("create")}
            sx={modalPrimaryActionButtonSx}
          >
            Project
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            disabled={!selectedProject}
            onClick={() => openMilestoneDialog("create")}
            sx={modalActionButtonSx}
          >
            Milestone
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            disabled={!selectedProject}
            onClick={() => openTaskDialog("create")}
            sx={modalActionButtonSx}
          >
            Task
          </Button>
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ p: 2 }}>
        <Paper sx={{ p: 2, borderRadius: 1 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <FormControl size="small" sx={{ minWidth: 280 }}>
              <InputLabel>Project</InputLabel>
              <Select
                label="Project"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value as number | "")}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              {loading ? "Loading..." : `${visibleMilestones.length} milestones, ${visibleTasks.length} tasks`}
            </Typography>
          </Stack>
        </Paper>

        <VirtualizedTable
          tableHead="Projects"
          height="360px"
          columns={projectColumns}
          rows={projects.map((project) => ({
            id: project.id,
            name: project.code || "",
            description: project.description || "",
            actions: null,
            onEdit: () => openProjectDialog("edit", project),
            onDelete: () =>
              setDeleteTarget({
                type: "project",
                id: project.id,
                label: project.code || `Project ${project.id}`,
              }),
          }))}
        />

        <VirtualizedTable
          tableHead={selectedProject ? `Milestones - ${selectedProject.code}` : "Milestones"}
          height="360px"
          columns={milestoneColumns}
          rows={visibleMilestones.map((milestone) => ({
            id: milestone.id,
            name: milestone.name,
            category: milestone.category ?? "",
            actions: null,
            onEdit: () => openMilestoneDialog("edit", milestone),
            onDelete: () =>
              setDeleteTarget({
                type: "milestone",
                id: milestone.id,
                label: milestone.name,
              }),
          }))}
        />

        <VirtualizedTable
          tableHead={selectedProject ? `Tasks - ${selectedProject.code}` : "Tasks"}
          height="420px"
          columns={taskColumns}
          rows={visibleTasks.map((task) => {
            const milestone = milestones.find((item) => item.id === task.milestone);

            return {
              id: task.id,
              name: task.name,
              milestone: milestone?.name ?? "",
              cost: task.cost ?? "",
              description: task.description ?? "",
              actions: null,
              onEdit: () => openTaskDialog("edit", task),
              onDelete: () =>
                setDeleteTarget({
                  type: "task",
                  id: task.id,
                  label: task.name,
                }),
            };
          })}
        />
      </Stack>

      <Dialog open={dialogType !== null} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === "edit" ? "Edit" : "Create"} {dialogType}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {dialogType === "project" && (
            <Stack spacing={2}>
              <TextField
                label="Project Code"
                value={projectForm.code}
                onChange={(event) => setProjectForm((current) => ({ ...current, code: event.target.value }))}
                size="small"
                fullWidth
              />
              <TextField
                label="Description"
                value={projectForm.description}
                onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))}
                size="small"
                fullWidth
                multiline
                minRows={3}
              />
            </Stack>
          )}

          {dialogType === "milestone" && (
            <Stack spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  label="Project"
                  value={milestoneForm.project}
                  onChange={(event) =>
                    setMilestoneForm((current) => ({ ...current, project: event.target.value }))
                  }
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={String(project.id)}>
                      {project.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Milestone Name"
                value={milestoneForm.name}
                onChange={(event) => setMilestoneForm((current) => ({ ...current, name: event.target.value }))}
                size="small"
                fullWidth
              />
              <TextField
                label="Category"
                type="number"
                value={milestoneForm.category}
                onChange={(event) => setMilestoneForm((current) => ({ ...current, category: event.target.value }))}
                size="small"
                fullWidth
              />
            </Stack>
          )}

          {dialogType === "task" && (
            <Stack spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  label="Project"
                  value={taskForm.project}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      project: event.target.value,
                      milestone: "",
                    }))
                  }
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={String(project.id)}>
                      {project.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Milestone</InputLabel>
                <Select
                  label="Milestone"
                  value={taskForm.milestone}
                  onChange={(event) => setTaskForm((current) => ({ ...current, milestone: event.target.value }))}
                >
                  <MenuItem value="">None</MenuItem>
                  {milestoneOptionsForTask.map((milestone) => (
                    <MenuItem key={milestone.id} value={String(milestone.id)}>
                      {milestone.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Task Name"
                value={taskForm.name}
                onChange={(event) => setTaskForm((current) => ({ ...current, name: event.target.value }))}
                size="small"
                fullWidth
              />
              <TextField
                label="Cost"
                type="number"
                value={taskForm.cost}
                onChange={(event) => setTaskForm((current) => ({ ...current, cost: event.target.value }))}
                size="small"
                fullWidth
              />
              <TextField
                label="Description"
                value={taskForm.description}
                onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                size="small"
                fullWidth
                multiline
                minRows={3}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} sx={modalActionButtonSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void saveDialog()}
            disabled={saving}
            sx={modalPrimaryActionButtonSx}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Configuration"
        description={`Delete ${deleteTarget?.label ?? "this item"}?`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        confirmColor="error"
        confirmDisabled={deleting}
        titleIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteRecord}
      />
    </Box>
  );
}
