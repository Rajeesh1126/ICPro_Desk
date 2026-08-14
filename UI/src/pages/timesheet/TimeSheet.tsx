import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import Approval from "./Approval";
import Submission from "./Submission";
import Temp from "./Temp";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);
import { useEffect, useState } from "react";
import {
  AssignmentOutlined,
  WorkOutline,
  HelpOutline,
  ConfirmationNumberOutlined,
  LockOpenOutlined,
  UpdateOutlined,
  SendOutlined,
} from "@mui/icons-material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { marginBottomSectionSx, modalActionButtonSx, modalPrimaryActionButtonSx, pageHeaderSx, reportsPageBoxSx5, reportsPageFilterDrawerPaperSx, responsiveRightActionsSx } from "../../styles/common";
import { Button, Divider, Drawer, IconButton, ListItemIcon, Menu, MenuItem, Stack, Typography } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;



  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function TimeSheet() {
  const [value, setValue] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState<Dayjs>(dayjs());
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Monday - Sunday
  const weekStart = selectedWeek.startOf("week").add(1, "day");
  const weekEnd = weekStart.add(6, "day");

  const weekNumber = weekStart.isoWeek();

  const previousWeek = () => {
    setSelectedWeek((prev) => prev.subtract(1, "week"));
  };

  const nextWeek = () => {
    setSelectedWeek((prev) => prev.add(1, "week"));
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // const permissionList = JSON.parse(
  //   localStorage.getItem("permissionList") ?? "[]",
  // ) as string[];

  const permissionList = [
    "view_ticket",
    "add_ticket",
    "view_self_tickets",
    "view_managementoverview",
    "view_report",
    "view_submission",
    "view_approval",
    "New",
  ];

  const tabConfig = [
    {
      permission: "view_submission",
      label: "Submission",
      component: < Submission />,
    },
    {
      permission: "view_approval",
      label: "Approval",
      component: <Approval />,
    },
    {
      permission: "New",
      label: "New",
      component: <Temp />,
    },
  ];

  const availableTabs = tabConfig.filter((tab) =>
    permissionList.includes(tab.permission),
  );

  useEffect(() => {
    if (availableTabs.length && value >= availableTabs.length) {
      setValue(0);
    }
  }, [availableTabs.length, value]);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={pageHeaderSx}>
        <Box>
          <Typography variant="h5">Time Sheet</Typography>
          <Typography variant="body2" color="text.secondary">
            submit and approve time sheets for your team.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={responsiveRightActionsSx}>
          {/* Previous Week */}
          <IconButton
            onClick={previousWeek}
            size="small"
            sx={{
              width: 36,
              height: 36,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <ChevronLeft />
          </IconButton>

          {/* Week Number */}
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{ minWidth: 70, textAlign: "center" }}
          >
            Week : {weekNumber}
          </Typography>

          <Divider orientation="vertical" flexItem />

          {/* Date Range */}
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              whiteSpace: "nowrap",
              minWidth: 190,
              textAlign: "center",
            }}
          >
            {weekStart.format("DD-MMM-YYYY")}
            {"  |  "}
            {weekEnd.format("DD-MMM-YYYY")}
          </Typography>

          {/* Next Week */}
          <IconButton
            onClick={nextWeek}
            size="small"
            sx={{
              width: 36,
              height: 36,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <ChevronRight />
          </IconButton>

          <Button
            sx={modalPrimaryActionButtonSx}
            variant="contained"
            onClick={handleClick}
          >
            Actions
          </Button>

          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            slotProps={{
              paper: {
                sx: {
                  mt: 0.8,
                  minWidth: 250,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: 4,
                  overflow: "hidden",
                  "& .MuiMenuItem-root": {
                    minHeight: 40,
                    px: 1.5,
                    py: 0.75,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    transition: "background-color 0.15s ease",

                    "&:last-child": {
                      borderBottom: "none",
                    },

                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  },
                },
              },
            }}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <WorkOutline fontSize="small" />
              </ListItemIcon>
              Assign Jobs From ERP
            </MenuItem>

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <HelpOutline fontSize="small" />
              </ListItemIcon>
              Create Undefined Jobs
            </MenuItem>

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <AssignmentOutlined fontSize="small" />
              </ListItemIcon>
              Undefined Tasks Import To Job
            </MenuItem>

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <ConfirmationNumberOutlined fontSize="small" />
              </ListItemIcon>
              Assigned Tickets
            </MenuItem>

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <LockOpenOutlined fontSize="small" />
              </ListItemIcon>
              Unlock Time Sheet Request
            </MenuItem>

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <UpdateOutlined fontSize="small" />
              </ListItemIcon>
              Extend Task To Next Week
            </MenuItem>

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <SendOutlined fontSize="small" />
              </ListItemIcon>
              Preview / Submit
            </MenuItem>
          </Menu>

        </Stack>
      </Box>

      <Box sx={{ mx: 2 }}>
        {availableTabs.length > 0 && (
          <Tabs value={value} onChange={handleChange}>
            {availableTabs.map((tab, index) => (
              <Tab
                key={tab.permission}
                label={tab.label}
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        )}
      </Box>

      {availableTabs.map((tab, index) => (
        <CustomTabPanel key={tab.permission} value={value} index={index}>
          {tab.component}
        </CustomTabPanel>
      ))}

      <Drawer anchor="right" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} PaperProps={{ sx: reportsPageFilterDrawerPaperSx }}>
        <Box sx={reportsPageBoxSx5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={marginBottomSectionSx} spacing={1.5}>
            <Typography variant="h6">Assign / Submit</Typography>
            <IconButton aria-label="Close filters" onClick={() => setFilterDrawerOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <Stack
            direction={{ xs: "column" }}
            justifyContent="space-between"
            spacing={1.5}
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Jobs
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Job Undefined
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Task Undefined
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Tickets
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Unlock Time Sheet Request
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Extend Task To Next Week
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Preview /Submit
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}

export default TimeSheet;
