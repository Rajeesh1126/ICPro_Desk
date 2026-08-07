import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  IconButton,
  Box,
  Grid,
  Chip,
  Stack,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import ThumbDownAltRoundedIcon from "@mui/icons-material/ThumbDownAltRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import api from "../../api/axios";
import { useState, useEffect } from "react";
import { Rating } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RatingModal from "./RatingInfoModel";
import ConfirmDialog from "../common/ConfirmDialog";
import Avatar from "@mui/material/Avatar";
import AttachmentIcon from "@mui/icons-material/Attachment";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import type {
  TicketData,
  TicketLog,
  UserSummary,
} from "../../types/TicketData";
import { formatDate, formatDateTime } from "../common/formatDate";
import { attachmentHeaderSx, attachmentIconSx, attachmentItemSx, attachmentListSx, attachmentNameSx, attachmentOpenSx, attachmentSectionSx, detailLabelSx, detailValueSx, formSectionSx, formatStatusLabel, getModalPalette, getPriorityPalette, getStatusColor, marginTopSectionSx, modalActionButtonSx, modalFormActionsSx, modalFormContentSx, modalFormHeaderSx, modalFormPaperSx, modalPrimaryActionButtonSx, pushRightSx, ticketsDetailModalAvatarSx1, ticketsDetailModalAvatarSx2, ticketsDetailModalBoxSx1, ticketsDetailModalBoxSx2, ticketsDetailModalCallbackCallbackSx1, ticketsDetailModalCallbackCallbackSx2, ticketsDetailModalCallbackCallbackSx3, ticketsDetailModalCallbackCallbackSx4, ticketsDetailModalCallbackCallbackSx5, ticketsDetailModalChipSx1, ticketsDetailModalDynamicDynamicBoxSx1, ticketsDetailModalDynamicDynamicBoxSx2, ticketsDetailModalDynamicDynamicBoxSx3, ticketsDetailModalDynamicDynamicBoxSx6, ticketsDetailModalDynamicDynamicBoxSx7, ticketsDetailModalDynamicDynamicBoxSx8, ticketsDetailModalDynamicDynamicBoxSx9, ticketsDetailModalDynamicDynamicChipSx1, ticketsDetailModalDynamicDynamicChipSx2, ticketsDetailModalDynamicDynamicStackSx1, ticketsDetailModalDynamicDynamicTypographySx1, ticketsDetailModalDynamicDynamicTypographySx2, ticketsDetailModalDynamicDynamicTypographySx3, ticketsDetailModalIconButtonSx1, ticketsDetailModalPaperSx1, ticketsDetailModalStackSx2, ticketsDetailModalTypographySx1, ticketsDetailModalTypographySx2, ticketsDetailModalTypographySx3, ticketsDetailModalTypographySx4, ticketsDetailModalTypographySx5, ticketsDetailModalTypographySx6 } from "../../styles/common";
import { showNotification } from "../../api/NotificationService";

type ActionData = Record<string, unknown> & { assigned_to?: string };

export default function TicketDetailModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: TicketData;
}) {
  // const status = data.current_status;
  // const status = data.current_status.includes("modified-") ? data.current_status.replace("modified-", "") : data.current_status;
  const status = data.current_status;
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const modalPalette = getModalPalette(theme);

  // const User = JSON.parse(localStorage.getItem("currentUser") || "null"); // Assuming you store user info in localStorage after login
  const currentUser = localStorage.getItem("currentUser");

  const User = currentUser ? JSON.parse(currentUser).id : null;
  const UserName = currentUser ? JSON.parse(currentUser).full_name : null;

  const pStyle = getPriorityPalette(theme, data.priority);
  const requiresEstimatedHours = Number(data.est_hours) === 0;

  const [openNotSatisfyModal, setOpenNotSatisfyModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openHoldModal, setOpenHoldModal] = useState(false);
  const [openRecallModal, setOpenRecallModal] = useState(false);
  const [openInProgressModal, setOpenInProgressModal] = useState(false);
  const [openFeedback, setOpenFeedback] = useState(false);

  const [remarks, setRemarks] = useState("");

  const [openRatingInfoModal, setOpenRatingInfoModal] = useState(false);

  const [openReassignModal, setOpenReassignModal] = useState(false);
  const [reassignUser, setReassignUser] = useState<string | null>(null);

  const [openAcceptModal, setOpenAcceptModal] = useState(false);
  const [estimatedHrs, setEstimatedHrs] = useState<number | null>(null);

  const [openRatingModal, setOpenRatingModal] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const [closeDblConfirmOpen, setcloseDblConfirmOpen] = useState(false);
  const [openRecallNCloseModal, setOpenRecallNCloseModal] = useState(false);

  const ratingLabels: { [key: number]: string } = {
    1: "Poor",
    2: "Average",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

    const statusMessages: Record<string, string> = {
    accepted: "Ticket accepted successfully.",
    completed: "Ticket completed successfully.",
    "in progress": "Ticket marked as In Progress successfully.",
    "feedback provided": "Feedback provided successfully.",
    "recall requested": "Recall request sent successfully.",
    "recall successful": "Recalled and closed successful.",
    "not-satisfied": "Ticket marked as Not Satisfactory successfully.",
    "on hold": "Ticket put on hold successfully.",
    closed: "Ticket closed successfully.",
    cancelled: "Ticket cancelled successfully.",
  };

  // This handles the actual final closure
  const submitClosure = () => {
    if (!rating) {
      alert("Please select a rating before closing.");
      return;
    }
    // Pass the status and the rating to your existing handleAction
    handleAction("closed", { rating: rating });
    setOpenRatingModal(false);
  };

  const [users, setUsers] = useState<UserSummary[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users/");
        setUsers(
          (Array.isArray(response.data) ? response.data : []) as UserSummary[],
        );
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    if (open) fetchUsers();
  }, [open]);

  const handleAction = async (action: string, additionalData?: ActionData) => {
    // Mapping UI actions to backend values

    try {
      let assignedId = "";
      let assignedName = "";
      if (additionalData?.assigned_to) {
        const [id, name] = additionalData.assigned_to.split("|");
        assignedId = id;
        assignedName = name;
      }

      // Construct the payload
      const payload = {
        current_status: action,
        ...additionalData,
        remarks: remarks
          ? remarks
          : `Status changed to "${action}" by user ${UserName}` +
          (additionalData?.assigned_to
            ? ` and assigned to ${assignedName}`
            : ""),
        assigned_to: additionalData?.assigned_to
          ? Number(assignedId)
          : data.assigned_to,
        // Spread additionalData to include 'rating' and any other custom fields
      };
      const response = await api.patch(`/tickets/${data.id}/`, payload);

      if (response.status === 200) {
        onClose();

        showNotification({
          type: "success",
          message:  statusMessages[action ?? ""] ??"Ticket updated successfully.",
        });
        // Optional: trigger a refresh here if you have a refresh function passed as prop
      }
    } catch (error: unknown) {
      console.error("Task status update failed", error);
    }
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth={true}
        maxWidth="lg"
        PaperProps={{ sx: modalFormPaperSx }}
      >
        <DialogTitle
          sx={ticketsDetailModalCallbackCallbackSx1({ modalFormHeaderSx })}
        >
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Avatar
              sx={ticketsDetailModalAvatarSx1}
            >
              <CheckIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography sx={detailLabelSx}>Ticket details</Typography>
              <Typography
                sx={ticketsDetailModalTypographySx1}
              >
                {data.number}
              </Typography>
              <Chip
                label={`${data.priority?.toUpperCase()} PRIORITY`}
                size="small"
                sx={ticketsDetailModalDynamicDynamicChipSx1({ pStyle })}
              />
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={2.5}
            alignItems="center"
            sx={pushRightSx}
          >
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={ticketsDetailModalDynamicDynamicStackSx1({ modalPalette })}
            >
              <Avatar
                sx={ticketsDetailModalAvatarSx2}
              >
                {data.assigned_to_name
                  ? data.assigned_to_name.charAt(0).toUpperCase()
                  : "U"}
              </Avatar>
              <Box>
                <Typography sx={detailLabelSx}>Assigned to</Typography>
                <Typography sx={ticketsDetailModalDynamicDynamicTypographySx1({ detailValueSx })}>
                  {data.assigned_to_name || "Unassigned"}
                </Typography>
              </Box>
            </Stack>
            <IconButton
              onClick={onClose}
              size="small"
              sx={ticketsDetailModalIconButtonSx1}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={ticketsDetailModalCallbackCallbackSx2({ modalFormContentSx })}
        >
          {/* MUI v6 Grid: Use 'size' and remove 'item' */}
          <Grid container spacing={2} sx={marginTopSectionSx}>
            {/* LEFT SIDE */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper
                variant="outlined"
                sx={ticketsDetailModalCallbackCallbackSx3({ formSectionSx })}
              >
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
                    {data.task}
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

                <Paper
                  variant="outlined"
                  sx={ticketsDetailModalPaperSx1}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <Box
                        sx={ticketsDetailModalDynamicDynamicBoxSx3({ modalPalette })}
                      >
                        <Box>
                          <Typography sx={detailLabelSx}>Estimated hrs</Typography>
                          <Typography sx={ticketsDetailModalDynamicDynamicTypographySx3({ detailValueSx })}>
                            {data.est_hours != null
                              ? `${data.est_hours} hrs`
                              : "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box
                        sx={ticketsDetailModalDynamicDynamicBoxSx3({ modalPalette })}
                      >
                        <Box>
                          <Typography sx={detailLabelSx}>actual hrs</Typography>
                          <Typography sx={ticketsDetailModalDynamicDynamicTypographySx3({ detailValueSx })}>
                            {data.act_hours != null
                              ? `${data.act_hours} hrs`
                              : "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box
                        sx={ticketsDetailModalDynamicDynamicBoxSx3({ modalPalette })}
                      >
                        <Box>
                          <Typography sx={detailLabelSx}>target date</Typography>
                          <Typography sx={ticketsDetailModalDynamicDynamicTypographySx3({ detailValueSx })}>
                            {data.target_date
                              ? formatDate(data.target_date)
                              : "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Paper>
            </Grid>

            {/* RIGHT SIDE (Timeline) */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                variant="outlined"
                sx={ticketsDetailModalCallbackCallbackSx4({ formSectionSx })}
              >
                <Box
                  sx={ticketsDetailModalDynamicDynamicBoxSx6({ modalPalette })}
                >
                  <Typography sx={ticketsDetailModalTypographySx4}>
                    Activity logs
                  </Typography>
                  <Chip
                    label="Latest First"
                    size="small"
                    sx={ticketsDetailModalChipSx1}
                  />
                </Box>
                <Box
                  sx={ticketsDetailModalBoxSx1}
                >
                  {/* Vertical Timeline Line */}
                  <Box
                    sx={ticketsDetailModalDynamicDynamicBoxSx7({ modalPalette })}
                  />

                  <Stack spacing={2}>
                    {data.logs?.map((log: TicketLog, index: number) => (
                      <Box key={log.id} sx={ticketsDetailModalBoxSx2}>
                        <Box
                          sx={ticketsDetailModalDynamicDynamicBoxSx8({ getStatusColor, log })}
                        />
                        <Box
                          sx={ticketsDetailModalDynamicDynamicBoxSx9({ index, modalPalette })}
                        >
                          <Chip
                            label={formatStatusLabel(log.status).toUpperCase()}
                            size="small"
                            sx={ticketsDetailModalDynamicDynamicChipSx2({ alpha, getStatusColor, isDark, log })}
                          />
                          <Typography
                            variant="body2"
                            sx={ticketsDetailModalTypographySx5}
                          >
                            {log.remarks}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.changed_by_name} : {/* dateformat */}
                            {formatDateTime(log.created_at)}
                            {/* {new Date(log.created_at).toLocaleDateString("en-GB")} */}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {data.files?.length ? (
            <Box sx={attachmentSectionSx(theme)}>
              <Box sx={attachmentHeaderSx}>
                <AttachmentIcon color="primary" fontSize="small" />
                <Typography sx={detailLabelSx}>Attachments ({data.files.length})</Typography>
              </Box>
              <Box sx={attachmentListSx}>
                {data.files.map((item: any) => {
                  const fileName = item.file?.split("/").pop() || "Attachment";

                  return (
                    <Box
                      key={item.id}
                      component="a"
                      href={item.file}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={attachmentItemSx(theme)}
                    >
                      <Box sx={attachmentIconSx(theme)}>
                        <AttachmentIcon fontSize="small" />
                      </Box>
                      <Typography sx={attachmentNameSx} title={fileName}>
                        {fileName}
                      </Typography>
                      <OpenInNewRoundedIcon sx={attachmentOpenSx} fontSize="small" />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : null}

        </DialogContent>

        <DialogActions
          sx={ticketsDetailModalCallbackCallbackSx5({ modalFormActionsSx })}
        >

          {/* Right: Action buttons */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={ticketsDetailModalStackSx2}
          >
            {/* Buttons here */}

            {/* 1. If status is OPEN and the logged-in user is the one ASSIGNED to the Task */}
            {["open", "modified", "reopened"].includes(status) &&
              data.assigned_to === User && (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    onClick={() => setOpenAcceptModal(true)}
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleRoundedIcon />}
                    sx={modalPrimaryActionButtonSx}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => setOpenReassignModal(true)}
                    variant="contained"
                    color="secondary"
                    startIcon={<PersonAddAltRoundedIcon />}
                    sx={modalPrimaryActionButtonSx}
                    disabled
                  >
                    Reassign
                  </Button>
                  <Button
                    onClick={() => setOpenHoldModal(true)}
                    variant="outlined"
                    color="warning"
                    startIcon={<PauseCircleOutlineRoundedIcon />}
                    sx={modalActionButtonSx}
                  >
                    On Hold
                  </Button>
                  <Button
                    onClick={() => setOpenRejectModal(true)}
                    variant="outlined"
                    color="error"
                    startIcon={<BlockRoundedIcon />}
                    sx={modalActionButtonSx}
                  >
                    Reject
                  </Button>

                </Stack>
              )}

            {/* 2. If status is accepted/assigned and the logged-in user recall request Ticket */}
            {["accepted", "assigned", "in progress", "feedback provided"].includes(status) &&
              data.creator === User && (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    // onClick={() => handleAction('recall requested')}
                    // openRecallModal
                    onClick={() => setOpenRecallModal(true)}
                    variant="outlined"
                    color="warning"
                    startIcon={<UndoRoundedIcon />}
                    sx={modalActionButtonSx}
                  >
                    Recall Request
                  </Button>
                  <Button
                    // onClick={() => handleAction("recall successful")}
                    onClick={() => setOpenFeedback(true)}
                    variant="contained"
                    color="info"
                    startIcon={<FeedbackOutlinedIcon />}
                    sx={modalPrimaryActionButtonSx}
                  >
                    FeedBack
                  </Button>
                </Stack>
              )}

            {/* 3. If Task is already Accepted and assigned to the user */}
            {["accepted", "assigned", "not-satisfied", "in progress", "feedback provided"].includes(status) &&
              data.assigned_to === User && (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    onClick={() => setOpenInProgressModal(true)}
                    variant="contained"
                    color="primary"
                    startIcon={<PendingActionsRoundedIcon />}
                    sx={modalActionButtonSx}
                  >
                    Update Progress
                  </Button>
                  <Button
                    // onClick={() => handleAction("completed")}
                    onClick={() => setcloseDblConfirmOpen(true)}
                    variant="contained"
                    color="success"
                    startIcon={<TaskAltRoundedIcon />}
                    sx={modalActionButtonSx}
                  >
                    Completed
                  </Button>
                </Stack>
              )}

            {/* 4.If the Task is already completed or Open or rejected then Task can close  and */}
            {["completed", "rejected"].includes(status) &&
              data.creator === User && (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    // onClick={() => handleAction('NotSatisfactory')}
                    onClick={() => setOpenNotSatisfyModal(true)}
                    variant="outlined"
                    color="error"
                    startIcon={<ThumbDownAltRoundedIcon />}
                    sx={modalActionButtonSx}
                  >
                    Not Satisfactory & Re Open
                  </Button>
                  <Button
                    // onClick={() => handleAction("recall successful")}
                    onClick={() => setOpenFeedback(true)}
                    variant="contained"
                    color="info"
                    startIcon={<FeedbackOutlinedIcon />}
                    sx={modalPrimaryActionButtonSx}
                  >
                    FeedBack
                  </Button>
                  <Button
                    onClick={() => setOpenRatingModal(true)} // Open modal first
                    variant="contained"
                    color="primary"
                    startIcon={<StarRoundedIcon />}
                    sx={modalActionButtonSx}
                  >
                    Rate & Close Ticket
                  </Button>
                </Stack>
              )}

            {/* 5. If the task is in recall requested state when the assigner part */}
            {((["open", "modified", "reopened", "not-satisfied"].includes(
              status,
            ) &&
              data.creator === User) ||
              (status === "recall requested" && data.assigned_to === User)) && (
                <Button
                  // onClick={() => handleAction("recall successful")}
                  onClick={() => setOpenRecallNCloseModal(true)}
                  variant="contained"
                  color="success"
                  startIcon={<AssignmentTurnedInRoundedIcon />}
                  sx={modalPrimaryActionButtonSx}
                >
                  Recall and closed
                </Button>
              )}
          </Stack>
        </DialogActions>
      </Dialog>

      {/* rating */}
      <ConfirmDialog
        open={openRatingModal}
        onClose={() => setOpenRatingModal(false)}
        onConfirm={submitClosure}
        title="Rate our Service"
        titleIcon={<StarRoundedIcon />}
        confirmLabel="Confirm & Close"
        confirmColor="primary"
        confirmIcon={<TaskAltRoundedIcon />}
        confirmDisabled={!rating}
        titleAdornment={
          <IconButton
            size="small"
            onClick={() => setOpenRatingInfoModal(true)}
            aria-label="Open rating guide"
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        }
      >
        <Stack alignItems="center" spacing={2} sx={marginTopSectionSx}>
          <Typography variant="body1">
            How would you rate the resolution of this Ticket?
          </Typography>
          <Rating
            size="large"
            value={rating}
            onChange={(_event, newValue) => setRating(newValue)}
          />
          {rating !== null && (
            <Typography sx={ticketsDetailModalTypographySx6}>
              {ratingLabels[rating]}
            </Typography>
          )}
        </Stack>
        <RatingModal
          open={openRatingInfoModal}
          handleClose={() => setOpenRatingInfoModal(false)}
        />
      </ConfirmDialog>

      {/* rejection */}
      <ConfirmDialog
        open={openRejectModal}
        onClose={() => setOpenRejectModal(false)}
        onConfirm={() => {
          void handleAction("rejected", { remarks });
          setOpenRejectModal(false);
        }}
        title="Reject Ticket"
        titleIcon={<BlockRoundedIcon />}
        description="Please provide a reason for rejecting this ticket. This will be visible to the creator."
        confirmLabel="Confirm Rejection"
        confirmColor="error"
        confirmIcon={<BlockRoundedIcon />}
        confirmDisabled={!remarks.trim()}
        tone="error"
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Reason for Rejection"
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="e.g., Insufficient information provided, Duplicate ticket, Out of scope..."
        />
      </ConfirmDialog>

      {/* hold */}
      <ConfirmDialog
        open={openHoldModal}
        onClose={() => setOpenHoldModal(false)}
        onConfirm={() => {
          void handleAction("on hold", { remarks });
          setOpenHoldModal(false);
        }}
        title="Hold Ticket"
        titleIcon={<PauseCircleOutlineRoundedIcon />}
        description="Please provide a reason for holding this ticket. This will be visible to the creator."
        confirmLabel="Confirm On Hold"
        confirmColor="warning"
        confirmIcon={<PauseCircleOutlineRoundedIcon />}
        confirmDisabled={!remarks.trim()}
        tone="warning"
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Reason for Hold"
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="e.g., Insufficient information provided, Duplicate ticket, Out of scope..."
        />
      </ConfirmDialog>

      {/* reassign */}
      <ConfirmDialog
        open={openReassignModal}
        onClose={() => setOpenReassignModal(false)}
        onConfirm={() => {
          void handleAction(
            "assigned",
            reassignUser ? { assigned_to: reassignUser } : undefined,
          );
          setOpenReassignModal(false);
        }}
        title="Reassign Ticket"
        titleIcon={<PersonAddAltRoundedIcon />}
        description="Please select a person for reassignment."
        confirmLabel="Confirm Reassign"
        confirmColor="secondary"
        confirmIcon={<PersonAddAltRoundedIcon />}
        tone="secondary"
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Assign To</InputLabel>
            <Select
              label="Assign To"
              value={reassignUser ?? ""}
              onChange={(event: SelectChangeEvent) => {
                setReassignUser(event.target.value);
              }}
            >
              {users.map((user) => (
                <MenuItem
                  key={user.users_id}
                  value={`${user.users_id}|${user.first_name || user.username}`}
                >
                  {user.first_name || user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </ConfirmDialog>

      {/* Accept */}
      <ConfirmDialog
        open={openAcceptModal}
        onClose={() => setOpenAcceptModal(false)}
        onConfirm={() => {
          if (requiresEstimatedHours) {
            void handleAction("accepted", { est_hours: estimatedHrs });
          } else {
            void handleAction("accepted");
          }
          setOpenAcceptModal(false);
        }}
        title="Accept Ticket"
        titleIcon={<CheckCircleRoundedIcon />}
        description={
          requiresEstimatedHours
            ? "Please enter estimated hours before accepting this ticket."
            : `Are you sure you want to accept this ticket with ${data.est_hours} estimated hours?`
        }
        confirmLabel="Confirm Accept"
        confirmColor="success"
        confirmIcon={<CheckCircleRoundedIcon />}
        confirmDisabled={
          requiresEstimatedHours && Number(estimatedHrs) <= 0
        }
        tone="success"
      >
        {requiresEstimatedHours && (
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Estimated Hours"
              type="number"
              fullWidth
              size="small"
              value={estimatedHrs ?? ""}
              onChange={(event) => setEstimatedHrs(Number(event.target.value))}
            />
          </Grid>
        )}
      </ConfirmDialog>

      {/* not satisfied */}
      <ConfirmDialog
        open={openNotSatisfyModal}
        onClose={() => setOpenNotSatisfyModal(false)}
        onConfirm={() => {
          void handleAction("not-satisfied", { remarks });
          setOpenNotSatisfyModal(false);
        }}
        title="Not Satisfactory & Re Open Ticket"
        titleIcon={<ThumbDownAltRoundedIcon />}
        description="Please specify why this ticket is being marked as not satisfactory."
        confirmLabel="Confirm Not Satisfied"
        confirmColor="error"
        confirmIcon={<ThumbDownAltRoundedIcon />}
        confirmDisabled={!remarks.trim()}
        tone="error"
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Reason for not satisfactory"
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="e.g., Insufficient information provided, Duplicate ticket, Out of scope..."
        />
      </ConfirmDialog>

      {/* Update Progress */}
      <ConfirmDialog
        open={openInProgressModal}
        onClose={() => setOpenInProgressModal(false)}
        onConfirm={() => {
          void handleAction("in progress", { remarks });
          setOpenInProgressModal(false);
        }}
        title="Update Progress"
        titleIcon={<PendingActionsRoundedIcon />}
        description="Please provide an update on the current progress of this ticket."
        confirmLabel="Submit"
        confirmColor="info"
        confirmIcon={<SendRoundedIcon />}
        confirmDisabled={!remarks.trim()}
        tone="info"
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Progress Notes"
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="Describe the current progress, completed work, and any pending tasks..."
        />
      </ConfirmDialog>

      {/* Feedback */}
      <ConfirmDialog
        open={openFeedback}
        onClose={() => setOpenFeedback(false)}
        onConfirm={() => {
          void handleAction("feedback provided", { remarks });
          setOpenFeedback(false);
        }}
        title="Give Feedback"
        titleIcon={<PendingActionsRoundedIcon />}
        description="Please give feedback for this ticket."
        confirmLabel="Submit"
        confirmColor="info"
        confirmIcon={<SendRoundedIcon />}
        confirmDisabled={!remarks.trim()}
        tone="info"
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Feedback & Suggestions"
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="Provide your feedback on the task, including challenges, suggestions, or areas for improvement..."
        />
      </ConfirmDialog>

      {/* recall */}
      <ConfirmDialog
        open={openRecallModal}
        onClose={() => setOpenRecallModal(false)}
        onConfirm={() => {
          void handleAction("recall requested", { remarks });
          setOpenRecallModal(false);
        }}
        title="Recall Request Ticket"
        titleIcon={<UndoRoundedIcon />}
        description="Please specify the reason for requesting this ticket recall."
        confirmLabel="Confirm Request"
        confirmColor="error"
        confirmIcon={<UndoRoundedIcon />}
        confirmDisabled={!remarks.trim()}
        tone="error"
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Reason for recall request"
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="e.g., Insufficient information provided, Duplicate ticket, Out of scope..."
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={closeDblConfirmOpen}
        onClose={() => setcloseDblConfirmOpen(false)}
        onConfirm={async () => {
          try {
            await handleAction("completed");
            setcloseDblConfirmOpen(false);
          } catch (error) {
            console.error(error);
          }
        }}
        title="Confirm Completion"
        titleIcon={<TaskAltRoundedIcon />}
        description="This action will mark the ticket as completed. Do you want to continue?"
        confirmLabel="Confirm"
        confirmColor="success"
        confirmIcon={<TaskAltRoundedIcon />}
        tone="success"
      />

      <ConfirmDialog
        open={openRecallNCloseModal}
        onClose={() => setOpenRecallNCloseModal(false)}
        onConfirm={async () => {
          try {
            await handleAction("recall successful");
            setOpenRecallNCloseModal(false);
          } catch (error) {
            console.error(error);
          }
        }}
        title="Confirm Recall"
        titleIcon={<AssignmentTurnedInRoundedIcon />}
        description="This action will recall and close the ticket. Do you want to continue?"
        confirmLabel="Confirm"
        confirmColor="success"
        confirmIcon={<AssignmentTurnedInRoundedIcon />}
        tone="success"
      />
    </>
  );
}
