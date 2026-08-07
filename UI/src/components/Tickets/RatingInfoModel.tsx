import { Box, Dialog, DialogContent, DialogTitle, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { marginTopMediumSx, ticketsRatingInfoModelDynamicDynamicPaperSx1, ticketsRatingInfoModelPaperSx1, ticketsRatingInfoModelRatingDialogPaperSx, ticketsRatingInfoModelTypographySx2 } from "../../styles/common";

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
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth fullScreen={false} PaperProps={{ sx: ticketsRatingInfoModelRatingDialogPaperSx }}>
      <DialogTitle component="div">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">Rating guide</Typography>
            <Typography variant="body2" color="text.secondary">Use the descriptions below to select a consistent score.</Typography>
            </Box>
          <IconButton aria-label="Close rating guide" onClick={handleClose}>
            <CloseRoundedIcon />
            </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {ratingData.map((item) => (
            <Grid key={item.score} size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <Paper variant="outlined" sx={ticketsRatingInfoModelDynamicDynamicPaperSx1({ item })}>
                <Typography variant="h5" color="primary.main">{item.score}</Typography>
                <Typography fontWeight={800} sx={marginTopMediumSx}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={ticketsRatingInfoModelTypographySx2}>{item.description}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2} sx={ticketsRatingInfoModelTypographySx2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={ticketsRatingInfoModelPaperSx1}>
              <Typography fontWeight={800} gutterBottom>Parameters</Typography>
              <Typography variant="body2" color="text.secondary">Punctuality, quality, time management, completion against plan, and opportunities for improvement.</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={ticketsRatingInfoModelPaperSx1}>
              <Typography fontWeight={800} gutterBottom>Core values</Typography>
              <Typography variant="body2" color="text.secondary">Innovation, teamwork, commitment, integrity, customer satisfaction, and responsibility.</Typography>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
