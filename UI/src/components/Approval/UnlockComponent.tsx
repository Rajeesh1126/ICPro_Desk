import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
} from "@mui/material";
import { compactFieldSx, unlockRequestStyles } from "../../styles/common";
import type { timesheetStatusData } from "../../types/dataTypes";
import ConfirmDialog from "../common/ConfirmDialog";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";


interface UnlockComponentProps {
    unlockRequests: timesheetStatusData[];
    handleUnlockStatus: (
        id: number,
        status: string,
        comments?: string
    ) => Promise<boolean>;
}

const UnlockComponent: React.FC<UnlockComponentProps> = ({
    unlockRequests,
    handleUnlockStatus,
}) => {
    const [rejectModelOpen, setRejectModelOpen] = useState(false);
    const [rejectRequestId, setRejectRequestId] = useState<number | null>(null);
    const [comments, setcomments] = useState("");
    return (
        <Box sx={unlockRequestStyles.container}>

            {/* Header */}
            <Box sx={unlockRequestStyles.header}>
                <Typography sx={unlockRequestStyles.headerTitle} >
                    Unlock Requests ({unlockRequests.length})
                </Typography>
            </Box>

            {/* Request List */}
            <Box sx={unlockRequestStyles.requestList}>

                {unlockRequests.map((request) => (
                    <Card key={request.id} elevation={0} sx={unlockRequestStyles.card} >

                        {/* Request Header */}
                        <Box sx={unlockRequestStyles.cardHeader}>
                            <Typography sx={ unlockRequestStyles.cardHeaderText } >
                                {request.first_name} - Unlock Request
                            </Typography>
                        </Box>

                        {/* Request Body */}
                        <CardContent sx={unlockRequestStyles.cardContent}>

                            <Typography sx={unlockRequestStyles.reason} >
                                <strong>Reason:</strong>{" "}{request.unlock_reason}
                            </Typography>

                            {/* Buttons */}
                            <Box sx={ unlockRequestStyles.buttonContainer } >

                                {/* ACCEPT */}
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleUnlockStatus(request.id, "Unlocked") }
                                    sx={ unlockRequestStyles.acceptButton }
                                >
                                    ACCEPT
                                </Button>

                                {/* REJECT */}
                                <Button
                                    variant="contained"
                                    size="small"
                                    // onClick={() =>handleUnlockStatus(request.id, "Unlock Rejected")}
                                    onClick={() =>{setRejectModelOpen(true),setRejectRequestId(request.id)}}
                                    sx={ unlockRequestStyles.rejectButton }
                                >
                                    REJECT
                                </Button>

                            </Box>

                        </CardContent>
                    </Card>
                ))}

                {/* Empty State */}
                {unlockRequests.length === 0 && (
                    <Box sx={ unlockRequestStyles.emptyState} >
                        <Typography sx={ unlockRequestStyles.emptyText }>
                            No unlock requests
                        </Typography>
                    </Box>
                )}

            </Box>

            <ConfirmDialog
                open={rejectModelOpen}
                onClose={() => setRejectModelOpen(false)}
                onConfirm={async () => {
                    if (rejectRequestId === null) {
                        return;
                    }

                    if (
                        await handleUnlockStatus(
                            rejectRequestId,
                            "Unlock Rejected",
                            comments
                        )
                    ) {
                        setRejectModelOpen(false);
                        setRejectRequestId(null);
                        setcomments("");
                    }
                }}
                title="Reject Unlock Request"
                titleIcon={<TaskAltRoundedIcon />}
                description="Please provide a reason for rejecting this unlock request."
                confirmLabel="Confirm"
                confirmColor="error"
                confirmIcon={<TaskAltRoundedIcon />}
                confirmDisabled={!comments.trim()}
                tone="error"
            >
                <TextField
                    autoFocus
                    required
                    multiline
                    rows={4}
                    fullWidth
                    label="Reason for rejection"
                    value={comments}
                    onChange={(event) => setcomments(event.target.value)}
                    placeholder="e.g., Please provide a valid reason for the unlock request..."
                    sx={compactFieldSx}
                />
            </ConfirmDialog>
        </Box>
    );
};

export default UnlockComponent;