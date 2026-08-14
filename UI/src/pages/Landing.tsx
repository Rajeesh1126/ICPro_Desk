import { Box, Typography } from "@mui/material";

const Landing = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h6" color="text.secondary">
        Under Development...
      </Typography>
    </Box>
  );
};

export default Landing;