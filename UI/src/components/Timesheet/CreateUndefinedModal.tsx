import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface CreateUndefinedModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    description: string;
    customerName: string;
    jobNumber: string;
  }) => void | Promise<void>;
  submitting?: boolean;
}

type FormErrors = Partial<Record<"description" | "customerName" | "jobNumber", string>>;

const DESCRIPTION_MAX_LENGTH = 255;
const CUSTOMER_MAX_LENGTH = 100;
const JOB_NUMBER_MAX_LENGTH = 40;

const CreateUndefinedModal: React.FC<CreateUndefinedModalProps> = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
}) => {
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  const [formErrorData, setFormErrorData] = useState<FormErrors>({});

  const validate = (data: {
    description: string;
    customerName: string;
    jobNumber: string;
  }) => {
    const nextErrors: FormErrors = {};
    const finalDescription = data.jobNumber
      ? `${data.description} - ${data.jobNumber}`
      : data.description;

    if (!data.description) {
      nextErrors.description = "Description is required.";
    } else if (finalDescription.length > DESCRIPTION_MAX_LENGTH) {
      nextErrors.description = `Description with job number must be ${DESCRIPTION_MAX_LENGTH} characters or less.`;
    }

    if (data.customerName.length > CUSTOMER_MAX_LENGTH) {
      nextErrors.customerName = `Customer name must be ${CUSTOMER_MAX_LENGTH} characters or less.`;
    }

    if (data.jobNumber.length > JOB_NUMBER_MAX_LENGTH) {
      nextErrors.jobNumber = `Job number must be ${JOB_NUMBER_MAX_LENGTH} characters or less.`;
    }

    return nextErrors;
  };

  const clearFields = () => {
    setDescription("");
    setCustomerName("");
    setJobNumber("");
    setFormErrorData({});
  };

  const handleSubmit = async () => {
    const data = {
      description: description.trim(),
      customerName: customerName.trim(),
      jobNumber: jobNumber.trim(),
    };

    setDescription(data.description);
    setCustomerName(data.customerName);
    setJobNumber(data.jobNumber);

    const nextErrors = validate(data);
    setFormErrorData(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(data);
    clearFields();
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const clearError = (field: keyof FormErrors) => {
    setFormErrorData((current) => ({ ...current, [field]: undefined }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          fontSize: "20px",
          fontWeight: 600,
          color: "#555",
          borderBottom: "1px solid #ddd",
        }}
      >
        Undefined Jobs

        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: "#777",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          padding: "14px 16px 16px !important",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Project Name */}
          <TextField
            fullWidth
            placeholder="Description"
            value={description}
            onBlur={() => setDescription((current) => current.trim())}
            onChange={(e) => {
              setDescription(e.target.value);
              clearError("description");
            }}
            error={!!formErrorData.description}
            helperText={formErrorData.description}
            size="small"
          />

          {/* Customer Name */}
          <TextField
            fullWidth
            placeholder="Customer Name"
            value={customerName}
            onBlur={() => setCustomerName((current) => current.trim())}
            onChange={(e) => {
              setCustomerName(e.target.value);
              clearError("customerName");
            }}
            error={!!formErrorData.customerName}
            helperText={formErrorData.customerName}
            size="small"
          />

          {/* Job Number */}
          <TextField
            fullWidth
            placeholder="Job Number"
            value={jobNumber}
            onBlur={() => setJobNumber((current) => current.trim())}
            onChange={(e) => {
              setJobNumber(e.target.value);
              clearError("jobNumber");
            }}
            error={!!formErrorData.jobNumber}
            helperText={formErrorData.jobNumber}
            size="small"
          />

          {/* Note */}
          <Typography
            sx={{
              color: "#f44336",
              fontSize: "13px",
              marginTop: "-5px",
            }}
          >
            * job Number is applicable only for US team, Others must leave this
            as blank.
          </Typography>

          {/* Submit */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "4px",
            }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting || description.trim().length === 0}
              sx={{
                minWidth: "173px",
                height: "34px",
                textTransform: "none",
                backgroundColor: "#55b3d2",
                boxShadow: "none",
                fontSize: "15px",
                "&:hover": {
                  backgroundColor: "#46a8c8",
                  boxShadow: "none",
                },
              }}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUndefinedModal;
