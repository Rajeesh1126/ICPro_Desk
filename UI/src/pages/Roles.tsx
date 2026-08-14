import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CreateSelfTicketModel from "../components/SelfTickets/CreateModel";
import type {
    SelfTicketData,
} from "../types/dataTypes";
import SelfTicketDetailModel from "../components/SelfTickets/DetailModel";
import {
    flexColumnFillSx,
    modalActionButtonSx,
    pageHeaderSx,
    selfTicketsPageStackSx1,
} from "../styles/common";

function storedUserId(): number | null {
    const value = localStorage.getItem("user");

    if (!value) {
        return null;
    }
    const id = Number(value);
    return Number.isInteger(id) ? id : null;
}

export default function Roles() {
    const userId = useMemo(() => storedUserId(), []);
    const [selectedUser, setSelectedUser] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState<SelfTicketData | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);


    const openCreate = useCallback(() => {
        setSelectedRow(null);
        setEditing(false);
        setDialogOpen(true);
    }, []);

    const openEdit = useCallback((ticket: SelfTicketData) => {
        setSelectedRow(ticket);
        setEditing(true);
        setDialogOpen(true);
    }, []);

    const openDetails = useCallback((ticket: SelfTicketData) => {
        setSelectedRow(ticket);
        setEditing(false);
        setDialogOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setDialogOpen(false);
        setEditing(false);
        setSelectedRow(null);
        setRefreshKey((key) => key + 1);
    }, []);
    
    return (
        <Box sx={selfTicketsPageBoxSx2}>
            <Box component="main" sx={flexColumnFillSx}>
                <Box sx={pageHeaderSx}>
                    <Box>
                        <Typography variant="h5">Roles List</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage roles, permissions, and access levels
                        </Typography>
                    </Box>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        sx={selfTicketsPageStackSx1}
                    >
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {tabValue === 0 && (
                            <Button
                                startIcon={<AddRoundedIcon />}
                                variant="contained"
                                onClick={openCreate}
                                sx={modalActionButtonSx}
                            >
                                New User
                            </Button>
                        )}

                    </Stack>
                    </Stack>
                </Box>

                <Box sx={{ mx: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, value: number) => {
                            setTabValue(value);
                            setSelectedUser("");
                        }}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab label={`Roles `} />
                        <Tab label={`Role Permissions `} />
                    </Tabs>
                </Box>
            </Box>

            {!selectedRow && !editing && (
                <CreateSelfTicketModel
                    open={dialogOpen}
                    handleClose={closeDialog}
                    Data={null}
                />
            )}
            {selectedRow && editing && (
                <CreateSelfTicketModel
                    open={dialogOpen}
                    handleClose={closeDialog}
                    Data={selectedRow}
                />
            )}
            {selectedRow && !editing && (
                <SelfTicketDetailModel
                    open={dialogOpen}
                    onClose={closeDialog}
                    data={selectedRow}
                />
            )}
        </Box>
    );
}
