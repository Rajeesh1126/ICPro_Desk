import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SentimentVeryDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentVeryDissatisfiedOutlined";
import SentimentDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentDissatisfiedOutlined";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedOutlinedIcon from "@mui/icons-material/SentimentVerySatisfiedOutlined";
import DialogHeader from "@/components/common/DialogHeader";
import {
  ratingGuideCardSx,
  ratingGuideRowSx,
  ratingGuideScoreSx,
  ratingGuideDescriptionSx,
  ratingLegendSx,
  ratingTileBodySx,
  ratingTileHeaderSx,
  ratingTileStarSx,
  ratingDistributionTileSx,
} from "@/styles/common";

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
    sx={ratingLegendSx}
  >
    {items.map((item) => (
      <Box key={item} sx={ratingGuideRowSx}>
        <Typography component="span" sx={ratingGuideScoreSx}>
          •
        </Typography>
        <Typography
          component="span"
          sx={ratingGuideDescriptionSx}
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
        >
          <InfoOutlinedIcon />
        </IconButton>
      )}

      <Dialog
        open={open}
        onClose={close}
        fullWidth
        maxWidth="lg"
      >
        <DialogHeader
          title="Rating guide"
          subtitle="Use the descriptions below to select a consistent score."
          onClose={close}
        />

        <DialogContent>
          <Grid container spacing={1.2}>
            {ratings.map((rating) => (
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }} key={rating.title}>
                <Paper variant="outlined" sx={ratingDistributionTileSx}>
                  <Box
                    sx={ratingTileHeaderSx}
                  >
                    <Box sx={ratingTileStarSx}>
                      {rating.icon}
                    </Box>
                    <Typography fontWeight={600}>
                      {rating.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={ratingTileBodySx}>
                    {rating.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} sx={ratingTileBodySx}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={ratingGuideCardSx}>
                <Typography fontWeight={600} gutterBottom>Parameters</Typography>
                {bulletText(parameters)}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={ratingGuideCardSx}>
                <Typography fontWeight={600} gutterBottom>Core values</Typography>
                {bulletText(coreValues)}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
}
