import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import api from "../../api/axios";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import type { rolesData } from "../../types/dataTypes";
import { modalFormPaperSx, modalFormHeaderSx, modalFormContentSx, modalFormActionsSx, modalActionButtonSx, marginTopSmallSx,} from "../../styles/common";
import { showNotification } from "../../api/NotificationService";

type RoleModelProps = {
    open: boolean;
    editing: boolean;
    Data: rolesData | null;
    handleClose: () => void;
}

interface RoleFormData {
    name: string;
    description: string;
}

export default function RoleModel({
    open,
    editing,
    Data,
    handleClose,
}: RoleModelProps) {

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<RoleFormData>({
        name: "",
        description: "",
    });
    const [formErrorData, setFormErrorData] = useState<{
        name?: string;
        description?: string;
    }>({});

    useEffect(() => {
        if (Data) {
            setFormData({
                name: Data.name ?? "",
                description: Data.description ?? "",
            });
        } else {
            setFormData({
                name: "",
                description: "",
            });
        }
        setFormErrorData({});
    }, [Data, open]);

    const update = <K extends keyof RoleFormData>(
        field: K,
        value: RoleFormData[K]
    ) => setFormData((current) => ({ ...current, [field]: value }));

    const submit = async () => {
        setLoading(true);
        try {
            console.log("Role data:", { id: Data?.id, name: formData.name, description: formData.description, });
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== "id") {
                payload.append(key, String(value));
                }
            });
            await api[Data ? "patch" : "post"](
                Data ? `/roles/${Data.id}/` : "/roles/",
                payload,
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            handleClose();
            showNotification({
                type: "success",
                message: Data ? "Roles updated successfully." : "Roles created successfully.",
            });
        } catch (error: any) {
            if (error.response?.status === 400) {
                setFormErrorData(error.response.data);
            } else {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

   
    return (

        <Dialog
            open={open}
            onClose={loading ? undefined : handleClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: modalFormPaperSx }}
        >
            <DialogTitle component="div" sx={modalFormHeaderSx}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={1.5}
                >
                    <Box minWidth={0}>
                        <Typography variant="h6">
                            {editing ? "Edit Role" : "Create Role"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={marginTopSmallSx} >
                            {editing ? "Update role details and permissions." : "Create a new role and configure its permissions."}
                        </Typography>
                    </Box>


                    <IconButton aria-label="Close" onClick={handleClose} disabled={loading}> <CloseRoundedIcon /> </IconButton>
                </Stack>
            </DialogTitle>


            <DialogContent sx={modalFormContentSx} >
                <Stack spacing={2.25}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom> Role Details </Typography>

                        <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    required
                                    label="Role Name"
                                    fullWidth
                                    value={formData.name}
                                    onChange={(event) =>
                                        update("name", event.target.value)
                                    }
                                    error={!!formErrorData.name}
                                    helperText={formErrorData.name}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    required
                                    label="Description"
                                    multiline
                                    minRows={5}
                                    fullWidth
                                    value={formData.description}
                                    onChange={(event) =>
                                        update("description", event.target.value)
                                    }
                                    error={!!formErrorData.description}
                                    helperText={formErrorData.description}
                                    disabled={loading}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                    <Divider />

 
                {/*<Box>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                            Permissions
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Permission selection can be added here
                            once the permission API/data structure is
                            available.
                        </Typography>
                    </Box> */}
                </Stack>
            </DialogContent>

            <DialogActions sx={modalFormActionsSx}>

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                    sx={{ flex: 1 }}
                >

                    <Typography variant="caption" color="text.secondary">
                        Fields marked with{" "}
                        <Box component="span" sx={{ fontWeight: 700 }}>*</Box>{" "}are required.
                    </Typography>
                </Stack>

                <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<CloseRoundedIcon />}
                    onClick={handleClose}
                    disabled={loading}
                    sx={modalActionButtonSx}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={editing ? <SaveRoundedIcon /> : <AddRoundedIcon />}
                    onClick={() => void submit()}
                    disabled={loading || !formData.name.trim()}
                    sx={modalActionButtonSx}
                >
                    {loading ? "Saving..." : editing ? "Update" : "Submit"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}