import { Chip, IconButton, Paper, Stack } from "@mui/material";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import DateRange from "../../../components/common/DateRange";
import {
  centeredTextGroup,
  compactWeekChip,
  nowrapResponsiveText,
  squareIconButton,
  weekSelectorPanel,
} from "../../../styles/common";

interface WeekSelectorProps {
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  compact: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

/** "‹ Week 41 · 5 – 11 Oct 2026 ›" week picker in the Time Sheet header. */
export default function WeekSelector({
  weekNumber,
  weekStart,
  weekEnd,
  compact,
  onPrevious,
  onNext,
}: WeekSelectorProps) {
  return (
    <Paper elevation={0} sx={weekSelectorPanel(compact)}>
      <IconButton aria-label="Previous week" onClick={onPrevious} size="small" sx={squareIconButton}>
        <ChevronLeftOutlinedIcon />
      </IconButton>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 0.25, sm: 1 }}
        alignItems="center"
        justifyContent="center"
        sx={centeredTextGroup}
      >
        <Chip label={`Week ${weekNumber}`} size="small" color="primary" variant="outlined" sx={compactWeekChip} />
        <DateRange
          start={weekStart}
          end={weekEnd}
          format="full"
          showLength={false}
          sx={nowrapResponsiveText}
        />
      </Stack>

      <IconButton aria-label="Next week" onClick={onNext} size="small" sx={squareIconButton}>
        <ChevronRightOutlinedIcon />
      </IconButton>
    </Paper>
  );
}
