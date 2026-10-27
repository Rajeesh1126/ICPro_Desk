import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

import {
    VirtualizedTable,
    type ColumnData,
} from "@/components/common/TableView";

import type {
    ERPQuotation
} from "@/types/dataTypes";
import DialogHeader from "@/components/common/DialogHeader";
import {
  erpContentSx,
  erpTableAreaSx,
} from "@/styles/common";

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
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Reset transient state when the dialog closes, adjusting during render
    // (previous-value pattern) instead of in an effect.
    const [wasOpen, setWasOpen] = useState(open);
    if (wasOpen !== open) {
        setWasOpen(open);
        if (!open) {
            setSelectedIds([]);
        }
    }

    const handleSelectRow = (id: number) => {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((selectedId) => selectedId !== id)
                : [...current, id]
        );
    };

    const handleClose = () => {
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
                width: 50,
                render: (quotation) => (
                    <Checkbox
                        checked={selectedIds.includes(quotation.id)}
                        onChange={() => handleSelectRow(quotation.id)}
                    />
                ),
            },
            {
                label: "Quotation No",
                dataKey: "quotation_no",
                width: 120,
            },
            {
                label: "Customer",
                dataKey: "customer_name",
                width: 200,
            },
            {
                label: "Name",
                width: 250,
                searchValue: (quotation) =>
                    quotation.custom_project_name ||
                    quotation.system_name ||
                    quotation.project__name ||
                    "",
                render: (quotation): React.ReactNode => {
                    const projectName =
                        quotation.custom_project_name ||
                        quotation.system_name ||
                        quotation.project__name;

                    return projectName ? String(projectName) : "—";
                },
            },
            // {
            //     label: "Created Date",
            //     dataKey: "create_date",
            //     render: (quotation) =>
            //         quotation.create_date
            //             ? new Date(
            //                 quotation.create_date
            //             ).toLocaleDateString()
            //             : "",
            // },
        ],
        [selectedIds]
    );

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    height: "80vh",
                    overflow: "hidden",
                },
            }}
        >
            <DialogHeader
                title="Select ERP Quotation"
                subtitle="Choose one or more quotations to assign."
                onClose={handleClose}
                actions={
                    selectedIds.length > 0 && (
                        <Chip
                            color="primary"
                            variant="outlined"
                            label={`${selectedIds.length} selected`}
                        />
                    )
                }
            />

            <DialogContent
                sx={erpContentSx}
            >
                <Box
                    sx={erpTableAreaSx}
                >
                    <VirtualizedTable
                        columns={columns}
                        rows={quotations}
                        height="100%"
                        tableHead="ERP Quotations"
                    />
                </Box>
            </DialogContent>

            <DialogActions>

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
