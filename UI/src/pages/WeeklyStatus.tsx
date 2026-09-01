import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";

import SubmissionStatus from "../components/Analysis/SubmissionStatus";

const WeeklyStatus: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "550px",
                backgroundColor: "#fff",
                borderRadius: "6px",
                boxShadow: "0 1px 5px rgba(0,0,0,0.20)",
                overflow: "hidden",
                fontFamily: "Arial, sans-serif",
            }}
        >
            {/* ================= TABS ================= */}

            <Box sx={{ mx: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, value) => setActiveTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                >
                    <Tab label="Weekly Timesheet Submission Status" />

                    <Tab label="Weekly Timesheet Approval Status" />
                </Tabs>
            </Box>

            {/* ================= TAB CONTENT ================= */}

            {activeTab === 0 && <SubmissionStatus />}

            {activeTab === 1 && (
                <Box
                    sx={{
                        p: 3,
                        fontSize: "13px",
                        color: "#555",
                    }}
                >
                    Weekly Timesheet Approval Status
                </Box>
            )}
        </Box>
    );
};

export default WeeklyStatus;