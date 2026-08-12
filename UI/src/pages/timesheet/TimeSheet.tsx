import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import TimeSheetApproval from "./TimeSheetApproval";
import TimeSheetSubmission from "./TimeSheetSubmission";
import Temp from "./Temp";

import { useEffect, useState } from "react";
import { pageHeaderSx } from "../../styles/common";
import { Typography } from "@mui/material";

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
      component: <TimeSheetSubmission />,
    },
    {
      permission: "view_approval",
      label: "Approval",
      component: <TimeSheetApproval />,
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
    </Box>
  );
}

export default TimeSheet;
