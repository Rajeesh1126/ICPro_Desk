import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SentimentVeryDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentVeryDissatisfiedOutlined";
import SentimentDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentDissatisfiedOutlined";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedOutlinedIcon from "@mui/icons-material/SentimentVerySatisfiedOutlined";

type RatingItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const ratings: RatingItem[] = [
  {
    title: "Poor",
    description: "Did not meet objectives and/or consistently violated core values",
    icon: <SentimentVeryDissatisfiedOutlinedIcon />,
  },
  {
    title: "Average",
    description:
      "Did not meet most objectives and/or did not demonstrate core values at the required level",
    icon: <SentimentDissatisfiedOutlinedIcon />,
  },
  {
    title: "Good",
    description:
      "Consistently met and in some cases exceeded objectives, consistently demonstrated core values",
    icon: <SentimentSatisfiedOutlinedIcon />,
  },
  {
    title: "Very Good",
    description:
      "Exceeded majority of objectives; consistently demonstrated core values and role models of few",
    icon: <SentimentSatisfiedAltOutlinedIcon />,
  },
  {
    title: "Excellent",
    description:
      "Exceeded performance expectations and role models the core values",
    icon: <SentimentVerySatisfiedOutlinedIcon />,
  },
];

const parameters = [
  "Punctuality of submission of works / tasks",
  "Quality of work / task (No potential reworks)",
  "Time management & multi-tasking",
  "Completeness or Progress of work / task (Actual progress Vs Planned progress)",
  "Provide / utilize opportunity for improvements",
];

const coreValues = [
  "Innovation",
  "Goals",
  "Team Work",
  "Commitment",
  "Integrity",
  "Customers Satisfaction",
  "Responsibility",
];

const bulletText = (items: string[]) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: "4px 10px",
      alignItems: "center",
    }}
  >
    {items.map((item) => (
      <Box key={item} sx={{ display: "flex", alignItems: "flex-start" }}>
        <Typography component="span" sx={{ fontSize: 14, lineHeight: 1.5 }}>
          •
        </Typography>
        <Typography
          component="span"
          sx={{ fontSize: 14, lineHeight: 1.5, ml: 1 }}
        >
          {item}
        </Typography>
      </Box>
    ))}
  </Box>
);

type RatingsDistributionProps = {
  open?: boolean;
  onClose?: () => void;
};

export default function RatingsDistribution({
  open: controlledOpen,
  onClose,
}: RatingsDistributionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const close = () => {
    onClose?.();
    if (!isControlled) setInternalOpen(false);
  };

  return (
    <>
      {!isControlled && (
        <IconButton
          aria-label="Open rating information"
          onClick={() => setInternalOpen(true)}
          size="small"
        >
          <InfoOutlinedIcon />
        </IconButton>
      )}

      <Dialog
        open={open}
        onClose={close}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: "calc(100dvh - 16px)", sm: "calc(100dvh - 32px)" },
          },
        }}
      >
        <DialogTitle component="div">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6">Rating guide</Typography>
              <Typography variant="body2" color="text.secondary">
                Use the descriptions below to select a consistent score.
              </Typography>
            </Box>
            <IconButton aria-label="Close rating guide" onClick={close}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={1.2}>
            {ratings.map((rating) => (
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }} key={rating.title}>
                <Paper variant="outlined" sx={{ height: "100%", p: 2, textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                    }}
                  >
                    <Box sx={{ color: "warning.main", display: "flex" }}>
                      {rating.icon}
                    </Box>
                    <Typography fontWeight={800}>
                      {rating.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {rating.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <Typography fontWeight={800} gutterBottom>Parameters</Typography>
                {bulletText(parameters)}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <Typography fontWeight={800} gutterBottom>Core values</Typography>
                {bulletText(coreValues)}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
}
