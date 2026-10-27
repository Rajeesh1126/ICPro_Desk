import { useId, useRef, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  fileUploadButtonSx,
  fileUploadErrorSx,
  fileUploadNameSx,
  fileUploadRulesSx,
  strongTextSx,
} from "@/styles/common";

/**
 * Upload limits shown to users before they pick a file. Keep these in sync
 * with the API's validation so the client never accepts a file the server rejects.
 */
export const DOCUMENT_UPLOAD_RULES = {
  accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.png,.jpg,.jpeg",
  acceptLabel: "PDF, Word, Excel, PowerPoint, TXT, CSV, ZIP, PNG or JPG",
  maxSizeMb: 25,
} as const;

interface FileUploadFieldProps {
  file: File | null;
  onChange: (file: File | null) => void;
  /** Name of the file already stored on the record, when editing. */
  existingFileName?: string | null;
  required?: boolean;
  accept?: string;
  acceptLabel?: string;
  maxSizeMb?: number;
  buttonLabel?: string;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** File picker that states accepted types, size limit and replacement behaviour up front. */
export default function FileUploadField({
  file,
  onChange,
  existingFileName,
  required = false,
  accept = DOCUMENT_UPLOAD_RULES.accept,
  acceptLabel = DOCUMENT_UPLOAD_RULES.acceptLabel,
  maxSizeMb = DOCUMENT_UPLOAD_RULES.maxSizeMb,
  buttonLabel = "Choose File",
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const helpId = useId();
  const [error, setError] = useState("");

  const handleChange = (selected: File | null) => {
    if (selected && selected.size > maxSizeMb * 1024 * 1024) {
      setError(`"${selected.name}" is ${formatSize(selected.size)}. The limit is ${maxSizeMb} MB.`);
      onChange(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setError("");
    onChange(selected);
  };

  const fileGuidance = existingFileName
    ? {
        label: "Current file",
        value: `${existingFileName}. A new file replaces it when you save; leave empty to keep it.`,
      }
    : required
      ? { label: "File requirement", value: "A file is required." }
      : { label: "File requirement", value: "Attaching a file is optional." };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept}
          onChange={(event) => handleChange(event.target.files?.[0] ?? null)}
        />
        <Button
          variant="outlined"
          startIcon={<UploadFileOutlinedIcon />}
          onClick={() => inputRef.current?.click()}
          aria-describedby={helpId}
          sx={fileUploadButtonSx}
        >
          {buttonLabel}
        </Button>
        <Typography variant="body2" sx={fileUploadNameSx}>
          {file ? `${file.name} (${formatSize(file.size)})` : "No new file selected"}
        </Typography>
      </Stack>
      <Stack
        id={helpId}
        component="ul"
        spacing={0.25}
        sx={fileUploadRulesSx}
      >
        <Typography component="li" variant="caption">
          <Box component="span" sx={strongTextSx}>Accepted formats:</Box> {acceptLabel}
        </Typography>
        <Typography component="li" variant="caption">
          <Box component="span" sx={strongTextSx}>Maximum size:</Box> {maxSizeMb} MB
        </Typography>
        <Typography component="li" variant="caption">
          <Box component="span" sx={strongTextSx}>{fileGuidance.label}:</Box> {fileGuidance.value}
        </Typography>
      </Stack>
      {error && (
        <Typography role="alert" variant="caption" color="error" component="p" sx={fileUploadErrorSx}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
