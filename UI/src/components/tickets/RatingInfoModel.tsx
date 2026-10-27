import { Dialog, DialogContent, Grid, Paper, Typography } from "@mui/material";
import { marginTopMediumSx, ratingTileSx, ratingGuidePanelSx, ratingGuideTextSx } from "@/styles/common";
import DialogHeader from "@/components/common/DialogHeader";

const ratingData = [
  { score: 1, title: "Poor", description: "Did not meet objectives or consistently demonstrate core values." },
  { score: 2, title: "Average", description: "Met some objectives but needs improvement in consistency and core values." },
  { score: 3, title: "Good", description: "Consistently met objectives and demonstrated the expected core values." },
  { score: 4, title: "Very good", description: "Exceeded most objectives and acted as a role model in several areas." },
  { score: 5, title: "Excellent", description: "Exceeded performance expectations and consistently modelled core values." },
];

type RatingModalProps = { open: boolean; handleClose: () => void };

export default function RatingModal({ open, handleClose }: RatingModalProps) {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth fullScreen={false}>
      <DialogHeader
        title="Rating guide"
        subtitle="Use the descriptions below to select a consistent score."
        onClose={handleClose}
      />
      <DialogContent>
        <Grid container spacing={2}>
          {ratingData.map((item) => (
            <Grid key={item.score} size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <Paper variant="outlined" sx={ratingTileSx({ item })}>
                <Typography variant="h5" color="primary.main">{item.score}</Typography>
                <Typography fontWeight={600} sx={marginTopMediumSx}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={ratingGuideTextSx}>{item.description}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2} sx={ratingGuideTextSx}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={ratingGuidePanelSx}>
              <Typography fontWeight={600} gutterBottom>Parameters</Typography>
              <Typography variant="body2" color="text.secondary">Punctuality, quality, time management, completion against plan, and opportunities for improvement.</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={ratingGuidePanelSx}>
              <Typography fontWeight={600} gutterBottom>Core values</Typography>
              <Typography variant="body2" color="text.secondary">Innovation, teamwork, commitment, integrity, customer satisfaction, and responsibility.</Typography>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
