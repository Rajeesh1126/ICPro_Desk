import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

import {
    VirtualizedTable,
    type ColumnData,
} from "../../components/common/TableView";

import type {
    ERPQuotation
} from "../../types/dataTypes";

interface ERPQuotationModalProps {
    open: boolean;
    onClose: () => void;
    quotations: ERPQuotation[];
    loading?: boolean;
    submitting?: boolean;
    onSelect?: (quotations: ERPQuotation[]) => void;
}

const ERPQuotationModal: React.FC<ERPQuotationModalProps> = ({
    open,
    onClose,
    quotations,
    loading = false,
    submitting = false,
    onSelect,
}) => {
    const [search, setSearch] = useState<string>("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Reset transient state when the dialog closes, adjusting during render
    // (previous-value pattern) instead of in an effect.
    const [wasOpen, setWasOpen] = useState(open);
    if (wasOpen !== open) {
        setWasOpen(open);
        if (!open) {
            setSearch("");
            setSelectedIds([]);
        }
    }

    const filteredQuotations = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return quotations;
        }

        return quotations.filter((quotation) =>
            [
                quotation.quotation_no,
                quotation.revision_number,
                quotation.sale_type,
                quotation.status,
                quotation.customer_name,
                quotation.custom_project_name,
                quotation.system_name,
            ]
                .filter((item) => item !== null && item !== undefined)
                .some((item) => String(item).toLowerCase().includes(value))
        );
    }, [quotations, search]);

    const handleSelectRow = (id: number) => {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((selectedId) => selectedId !== id)
                : [...current, id]
        );
    };

    const handleClose = () => {
        setSearch("");
        setSelectedIds([]);
        onClose();
    };

    const handleSelect = () => {
        const selectedQuotations = quotations.filter((quotation) =>
            selectedIds.includes(quotation.id)
        );

        if (selectedQuotations.length > 0) {
            onSelect?.(selectedQuotations);
        }
    };

    const columns = useMemo<ColumnData<ERPQuotation>[]>(
        () => [
            {
                label: "Select",
                render: (quotation) => (
                    <Checkbox
                        checked={selectedIds.includes(quotation.id)}
                        onChange={() => handleSelectRow(quotation.id)}
                        size="small"
                    />
                ),
            },
            {
                label: "Quotation No",
                dataKey: "quotation_no",
            },
            {
                label: "Customer",
                dataKey: "customer_name",
            },
            {
                label: "Project Name",
                render: (quotation): React.ReactNode => {
                    const projectName =
                        quotation.custom_project_name ||
                        quotation.system_name ||
                        quotation.project__name;

                    return projectName ? String(projectName) : "-";
                },
            },
            {
                label: "Created Date",
                dataKey: "create_date",
                render: (quotation) =>
                    quotation.create_date
                        ? new Date(
                            quotation.create_date
                        ).toLocaleDateString()
                        : "",
            },
        ],
        [selectedIds]
    );

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="xl"
            PaperProps={{
                sx: {
                    height: "80vh",
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle sx={{ px: 3, py: 2 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                        <RequestQuoteOutlinedIcon color="primary" />
                        <Box>
                            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                                Select ERP Quotation
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Choose one or more quotations to assign.
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        {selectedIds.length > 0 && (
                            <Chip
                                size="small"
                                color="primary"
                                variant="outlined"
                                label={`${selectedIds.length} selected`}
                                sx={{ fontWeight: 600 }}
                            />
                        )}
                        <Tooltip title="Close">
                            <IconButton size="small" onClick={handleClose}>
                                <CloseOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    overflow: "hidden",
                    px: 3,
                    py: 2,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                    }}
                >
                    <VirtualizedTable
                        columns={columns}
                        rows={filteredQuotations}
                        height="100%"
                        tableHead="ERP Quotations"
                    />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="outlined"
                    onClick={handleClose}
                    startIcon={<CancelOutlinedIcon />}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={<AssignmentTurnedInOutlinedIcon />}
                    onClick={handleSelect}
                    disabled={selectedIds.length === 0 || loading || submitting}
                >
                    {submitting
                        ? "Assigning..."
                        : loading
                            ? "Loading..."
                            : selectedIds.length > 0
                                ? `Assign (${selectedIds.length})`
                                : "Assign"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ERPQuotationModal;
