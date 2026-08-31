import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,

} from "@mui/material";

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
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (!open) {
            setSearch("");
            setSelectedIds([]);
        }
    }, [open]);

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
                },
            }}
        >
            <DialogTitle>
                Select ERP Quotation
            </DialogTitle>

            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    overflow: "hidden",
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
                <Button onClick={handleClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSelect}
                    disabled={selectedIds.length === 0 || loading || submitting}
                >
                    {submitting ? "Assigning..." : loading ? "Loading..." : "Assign"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ERPQuotationModal;
