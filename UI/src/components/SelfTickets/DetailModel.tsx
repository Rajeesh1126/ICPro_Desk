import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Box,
    Grid,
    Chip,
    Stack,
    Paper,
    TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

import SendRoundedIcon from "@mui/icons-material/SendRounded";

import AssignmentIcon from "@mui/icons-material/Assignment";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";

import api from "../../api/axios";
import { useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import type { SelfTicketData } from "../../types/dataTypes";
import Avatar from "@mui/material/Avatar";
import ConfirmDialog from "../common/ConfirmDialog";
import {
    compactFieldSx,
    detailLabelSx,
    detailValueSx,
    formSectionSx,
    getModalPalette,
    getPriorityPalette,
    modalFormActionsSx,
    modalFormContentSx,
    modalFormHeaderSx,
    modalFormIconSx,
    modalFormPaperSx,
    modalPrimaryActionButtonSx,
    selfTicketsDetailModelAvatarSx1,
    selfTicketsDetailModelBoxSx1,
    selfTicketsDetailModelButtonSx1,
    selfTicketsDetailModelCommentPaperSx,
    selfTicketsDetailModelCommentTitleSx,
    selfTicketsDetailModelCommentWrapperSx,
    selfTicketsDetailModelDynamicDynamicBoxSx2,
    selfTicketsDetailModelDynamicDynamicChipSx1,
    selfTicketsDetailModelDynamicDynamiccommentBoxSx,
    selfTicketsDetailModelDynamicDynamicDialogActionsSx1,
    selfTicketsDetailModelDynamicDynamicStackSx1,
    selfTicketsDetailModelDynamicDynamicTypographySx4,
    selfTicketsDetailModelDynamicDynamicTypographySx5,
    selfTicketsDetailModelIconButtonSx1,
    selfTicketsDetailModelNoteBoxSx,
    selfTicketsDetailModelTypographySx1,
    selfTicketsDetailModelTypographySx2,
    selfTicketsDetailModelTypographySx3,
    selfTicketsDetailModelTypographySx6,
    ticketsDetailModalCallbackCallbackSx4,
    ticketsDetailModalDynamicDynamicBoxSx1,
    ticketsDetailModalDynamicDynamicBoxSx2,
    ticketsDetailModalDynamicDynamicTypographySx2,
    ticketsDetailModalTypographySx2,
    ticketsDetailModalTypographySx3,
} from "../../styles/common";
import { formatDateTime } from "../common/formatDate";
import { showNotification } from "../../api/NotificationService";

export default function TicketDetailModal({
    open,
    onClose,
    data,
}: {
    open: boolean;
    onClose: () => void;
    data: SelfTicketData;
}) {
    const [closeModelOpen, setCloseModelOpen] = useState(false);
    const [cancelModelOpen, setCancelModelOpen] = useState(false);
    const [openCommentsModal, setOpenCommentsModal] = useState(false);
    const [openProgressModal, setOpenProgressModal] = useState(false);
    const [comments, setcomments] = useState("");
    const [task, setTask] = useState(data);
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const modalPalette = getModalPalette(theme);

    const pStyle = getPriorityPalette(theme, data.priority);

    const currentUserParsed = Number(
        localStorage.getItem("user") || "null",
    );
    const userId = currentUserParsed ?? null;

    const statusMessages: Record<string, string> = {
        closed: "Do List task closed successfully.",
        cancelled: "Do List task cancelled successfully.",
    };


    const handleConfirm = async (
        status?: string,
        payload?: { comments?: string },
    ): Promise<boolean> => {
        try {
            const requestBody: {
                current_status?: string;
                comments?: string;
            } = {};

            if (status) {
                requestBody.current_status = status;

            }

            if (payload?.comments) {
                requestBody.comments = payload.comments;
            }
            const response = await api.patch(`/self-tickets/${task.id}/?do_List=true`, requestBody)

            showNotification({
                type: "success",
                message: statusMessages[status ?? ""] ?? "Do List task marked as In Progress successfully."
            });

            setTask(response.data)
            setcomments("")
            if (closeModelOpen || cancelModelOpen) {
                onClose()
            }

            return true;
        } catch (error) {
            console.error("Error closing Task:", error);
            return false;
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="md"
                PaperProps={{ sx: modalFormPaperSx }}
            >
                <DialogTitle component="div" sx={modalFormHeaderSx}>
                    <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Stack
                            direction="row"
                            spacing={1.25}
                            alignItems="center"
                            minWidth={0}
                        >
                            <Box sx={modalFormIconSx}>
                                <AssignmentIcon fontSize="small" />
                            </Box>
                            <Box>
                                <Typography sx={selfTicketsDetailModelTypographySx1}>
                                    Self task
                                </Typography>
                                <Typography
                                    variant="h6"
                                    fontWeight={900}
                                    sx={selfTicketsDetailModelTypographySx2}
                                >
                                    {task.number}
                                </Typography>
                                <Chip
                                    label={`${task.priority?.toUpperCase()} PRIORITY`}
                                    size="small"
                                    sx={selfTicketsDetailModelDynamicDynamicChipSx1({ pStyle })}
                                />
                            </Box>
                        </Stack>

                        <Box sx={selfTicketsDetailModelBoxSx1}>
                            {task.creator !== userId ? (
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={selfTicketsDetailModelDynamicDynamicStackSx1({
                                        alpha,
                                        isDark,
                                        theme,
                                    })}
                                >
                                    <Avatar sx={selfTicketsDetailModelAvatarSx1}>
                                        {task.creator_name
                                            ? task.creator_name.charAt(0).toUpperCase()
                                            : "U"}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={selfTicketsDetailModelTypographySx3}>
                                            Owner
                                        </Typography>
                                        <Typography sx={detailValueSx}>
                                            {task.creator_name || "Unassigned"}
                                        </Typography>
                                    </Box>
                                </Stack>
                            ) : (
                                ""
                            )}
                            <IconButton
                                onClick={onClose}
                                size="small"
                                sx={selfTicketsDetailModelIconButtonSx1}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={modalFormContentSx}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: task.logs?.length > 0 ? 8 : 12 }}>
                            <Paper variant="outlined" sx={formSectionSx}>
                                <Box
                                    sx={ticketsDetailModalDynamicDynamicBoxSx1({ theme })}
                                >
                                    <Typography
                                        sx={ticketsDetailModalDynamicDynamicTypographySx2({ alpha, detailLabelSx, theme })}
                                    >
                                        Subject
                                    </Typography>
                                    <Typography
                                        sx={ticketsDetailModalTypographySx2}
                                    >
                                        {task.task}
                                    </Typography>
                                </Box>
                                <Typography sx={detailLabelSx}>Description</Typography>
                                <Box
                                    sx={ticketsDetailModalDynamicDynamicBoxSx2({ modalPalette })}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={ticketsDetailModalTypographySx3}
                                    >
                                        {data.description}
                                    </Typography>
                                </Box>

                                <Grid container spacing={1.25}>
                                    {[
                                        {
                                            label: "Estimated hours",
                                            value:
                                                task.est_hours != null
                                                    ? `${task.est_hours} hrs`
                                                    : "N/A",
                                        },
                                        {
                                            label: "Target date",
                                            value: task.target_date
                                                ? task.target_date.split("-").reverse().join("-")
                                                : "N/A",
                                        },
                                        {
                                            label: "Task type",
                                            value: task.type || "Unassigned",
                                            capitalize: true,
                                        },
                                        {
                                            label: "Related ticket",
                                            value: task.ticket_number || "Not linked",
                                        },
                                        {
                                            label: "Reminder interval",
                                            value: task.reminder_interval
                                                ? `${task.reminder_interval} ${task.reminder_interval === 1 ? "day" : "days"}`
                                                : "Not set",
                                        },
                                        {
                                            label: "Current status",
                                            value: task.current_status || "Open",
                                            capitalize: true,
                                        },
                                    ].map(({ label, value, capitalize }) => (
                                        <Grid key={label} size={{ xs: 6, sm: 6, md: 4 }}>
                                            <Box
                                                sx={selfTicketsDetailModelDynamicDynamicBoxSx2({
                                                    alpha,
                                                    isDark,
                                                    theme,
                                                })}
                                            >
                                                <Typography
                                                    sx={selfTicketsDetailModelDynamicDynamicTypographySx4(
                                                        { detailLabelSx },
                                                    )}
                                                >
                                                    {label}
                                                </Typography>
                                                <Typography
                                                    sx={selfTicketsDetailModelDynamicDynamicTypographySx5(
                                                        { capitalize, detailValueSx },
                                                    )}
                                                >
                                                    {value}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                        {/* RIGHT SIDE (Timeline) */}
                        {task.logs?.length ? <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                                variant="outlined"
                                sx={ticketsDetailModalCallbackCallbackSx4({ formSectionSx })}
                            >
                                <Typography variant="h6" gutterBottom sx={selfTicketsDetailModelCommentTitleSx}>
                                    Status / Comments
                                </Typography>

                                <Box
                                    sx={selfTicketsDetailModelDynamicDynamiccommentBoxSx({
                                        alpha,
                                        isDark,
                                        theme,
                                    })}
                                >
                                    {task.logs?.map((log: any) => (
                                        <Box
                                            key={log.id}
                                            sx={selfTicketsDetailModelCommentWrapperSx({
                                                alpha,
                                                isDark,
                                                theme,
                                                isCurrentUser: log.creator === userId,
                                            })}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={selfTicketsDetailModelTypographySx6}
                                            >
                                                {log.creator_name || "User"}
                                                <Box component="span" sx={{ mx: 0.75 }}>

                                                    {formatDateTime(log.created_at)}
                                                </Box>
                                            </Typography>
                                            <Paper
                                                elevation={0}
                                                sx={selfTicketsDetailModelCommentPaperSx({
                                                    alpha,
                                                    isDark,
                                                    theme,
                                                    isCurrentUser: log.creator === userId,
                                                })}
                                            >
                                                <Typography variant="body2" color="text.primary">
                                                    {log.comments || "No comments"}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                        </Grid> : ""}
                    </Grid>
                </DialogContent>

                <DialogActions
                    sx={selfTicketsDetailModelDynamicDynamicDialogActionsSx1({
                        modalFormActionsSx,
                    })}
                >
                    {["open"].includes(task.current_status) &&
                        task.creator === userId && (
                            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap >
                                <Box
                                    sx={selfTicketsDetailModelNoteBoxSx({
                                        alpha,
                                        isDark,
                                        theme,
                                    })}
                                >
                                    <InfoOutlinedIcon color="primary" fontSize="small" />

                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Note:</strong> To edit or modify a To-Do List item, switch to{" "}
                                        <strong>Table (List) View</strong>. Editing is not available in{" "}
                                        <strong>Card View</strong>.
                                    </Typography>
                                </Box>
                                <Button
                                    onClick={() => setOpenProgressModal(true)}
                                    variant="contained"
                                    color="info"
                                    disabled={task.current_status === "closed"}
                                    startIcon={<PendingActionsRoundedIcon />}
                                    sx={modalPrimaryActionButtonSx}
                                >
                                    Update Progress
                                </Button>
                                <Button
                                    onClick={() => setCloseModelOpen(true)}
                                    variant="contained"
                                    color="success"
                                    startIcon={<TaskAltRoundedIcon />}
                                    sx={modalPrimaryActionButtonSx}
                                >
                                    Close Task
                                </Button>
                                <Button
                                    onClick={() => setCancelModelOpen(true)}
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CancelOutlinedIcon />}
                                    sx={modalPrimaryActionButtonSx}
                                >
                                    Cancel Task
                                </Button>
                            </Stack>
                        )}

                    {task.creator !== userId && (
                        <Button
                            onClick={() => setOpenCommentsModal(true)}
                            variant="outlined"
                            color="warning"
                            disabled={task.current_status === "closed"}
                            startIcon={<ChatBubbleOutlineRoundedIcon />}
                            sx={selfTicketsDetailModelButtonSx1}
                        >
                            Comments
                        </Button>
                    )}
                </DialogActions>
            </Dialog>


            <ConfirmDialog
                open={closeModelOpen}
                onClose={() => setCloseModelOpen(false)}
                onConfirm={async () => {
                    if (await handleConfirm("closed", { comments }))
                        setCloseModelOpen(false);
                }}
                title="Close Task"
                titleIcon={<TaskAltRoundedIcon />}
                description="Please provide a reason for closing this task"
                confirmLabel="Confirm"
                confirmColor="success"
                confirmIcon={<TaskAltRoundedIcon />}
                confirmDisabled={!comments.trim()}
                tone="success"
            >
                <TextField
                    autoFocus
                    required
                    multiline
                    rows={4}
                    fullWidth
                    label="Reason for task closure"
                    value={comments}
                    onChange={(event) => setcomments(event.target.value)}
                    placeholder="e.g., Task completed successfully, Issue resolved, Requirements fulfilled..."
                    sx={compactFieldSx}
                />
            </ConfirmDialog>

            <ConfirmDialog
                open={openProgressModal}
                onClose={() => setOpenProgressModal(false)}
                onConfirm={async () => {
                    if (await handleConfirm("", { comments }))
                        setOpenProgressModal(false);
                }}
                title="Update Progress"
                titleIcon={<TaskAltRoundedIcon />}
                description="Please provide an update on the current progress of this ticket."
                confirmLabel="Submit"
                confirmColor="info"
                confirmIcon={<SendRoundedIcon />}
                confirmDisabled={!comments.trim()}
                tone="info"
            >
                <TextField
                    autoFocus
                    required
                    multiline
                    rows={4}
                    fullWidth
                    label="Progress Notes"
                    value={comments}
                    onChange={(event) => setcomments(event.target.value)}
                    placeholder="Describe the current progress, completed work, and any pending tasks..."
                    sx={compactFieldSx}
                />
            </ConfirmDialog>

            <ConfirmDialog
                open={cancelModelOpen}
                onClose={() => setCancelModelOpen(false)}
                onConfirm={async () => {
                    if (await handleConfirm("cancelled", { comments }))
                        setCancelModelOpen(false);
                }}
                title="Cancel Task"
                titleIcon={<CancelOutlinedIcon />}
                description="Please provide a reason for cancelling this task"
                confirmLabel="Confirm"
                confirmColor="error"
                confirmIcon={<CancelOutlinedIcon />}
                confirmDisabled={!comments.trim()}
                tone="error"
            >
                <TextField
                    autoFocus
                    required
                    multiline
                    rows={4}
                    fullWidth
                    label="Reason for task cancellation"
                    value={comments}
                    onChange={(event) => setcomments(event.target.value)}
                    placeholder="e.g., Insufficient information provided, Duplicate task, Out of scope..."
                    sx={compactFieldSx}
                />
            </ConfirmDialog>

            <ConfirmDialog
                open={openCommentsModal}
                onClose={() => setOpenCommentsModal(false)}
                onConfirm={async () => {
                    if (await handleConfirm("", { comments }))
                        setOpenCommentsModal(false);
                }}
                title="Add Comments"
                titleIcon={<ChatBubbleOutlineRoundedIcon />}
                description="Please provide comments for this task."
                confirmLabel="Submit"
                confirmColor="warning"
                confirmIcon={<SendRoundedIcon />}
                confirmDisabled={!comments.trim()}
                tone="warning"
            >
                <TextField
                    autoFocus
                    required
                    multiline
                    rows={4}
                    fullWidth
                    label="Give Comments"
                    value={comments}
                    onChange={(event) => setcomments(event.target.value)}
                    placeholder="e.g., Insufficient information provided, Duplicate task, Out of scope..."
                    sx={compactFieldSx}
                />
            </ConfirmDialog>
        </>
    );
}