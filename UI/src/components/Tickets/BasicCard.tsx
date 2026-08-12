import { Card, CardContent, Typography, Box, Chip, Divider, Avatar, Stack } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { alpha } from "@mui/material/styles";
import type { TicketData } from '../../types/dataTypes';
import { formatDate } from '../common/formatDate';
import { compactTextSx, detailLabelSx, detailValueSx, minWidthZeroSx, pushRightSx, secondaryTextSx, ticketsBasicCardAvatarSx1, ticketsBasicCardBoxSx1, ticketsBasicCardBoxSx2, ticketsBasicCardCardContentSx1, ticketsBasicCardDividerSx1, ticketsBasicCardDynamicDynamicCardSx1, ticketsBasicCardDynamicDynamicChipSx1, ticketsBasicCardDynamicDynamicTypographySx1, ticketsBasicCardTypographySx1, ticketsBasicCardTypographySx2, ticketsBasicCardTypographySx3 } from "../../styles/common";

interface BasicCardProps {
    ticket: TicketData;
    onOpen: (data: TicketData) => void;
}

export default function BasicCardComponent({ ticket, onOpen }: BasicCardProps) {
    if (!ticket?.number) return null;

    const getPriorityStyles = (priority: string | null | undefined) => {
        switch (priority?.toLowerCase()) {
            case 'high': return { color: '#d32f2f', bg: '#feebea', border: '#fcc7c3' };
            case 'medium': return { color: '#d1a104', bg: '#fff4e5', border: '#ffe2b7' };
            case 'low': return { color: '#2e7d32', bg: '#edf7ed', border: '#c8e6c9' };
            default: return { color: '#607d8b', bg: '#f5f5f5', border: '#e0e0e0' };
        }
    };

    const styles = getPriorityStyles(ticket.priority);
    const assignedInitials = ticket.assigned_to_details 
        ? `${ticket.assigned_to_details.first_name?.[0] ?? ''}${ticket.assigned_to_details.last_name?.[0] ?? ''}` || '?'
        : '?';

    return (
        <Card
            elevation={0}
            onClick={() => onOpen(ticket)}
            sx={ticketsBasicCardDynamicDynamicCardSx1({ styles })}
        >
            <CardContent sx={ticketsBasicCardCardContentSx1}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={0.5} mb={1}>
                    <Typography sx={ticketsBasicCardDynamicDynamicTypographySx1({ styles })}>
                        Ticket No #{ticket.number}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={secondaryTextSx}>
                        <AccessTimeIcon sx={compactTextSx} />
                        <Typography sx={ticketsBasicCardTypographySx1}>
                            {ticket.created_at ? formatDate(ticket.created_at) : "N/A"}
                        </Typography>
                    </Stack>
                </Stack>

                <Typography variant="h6" sx={ticketsBasicCardTypographySx2}>
                    {ticket.task}
                </Typography>

                <Typography 
                    variant="body2" 
                    sx={ticketsBasicCardTypographySx3}
                >
                    {ticket.description}
                </Typography>

                <Divider sx={ticketsBasicCardDividerSx1} />

                <Box sx={ticketsBasicCardBoxSx1}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={minWidthZeroSx}>
                        <Avatar sx={ticketsBasicCardAvatarSx1}>
                            {assignedInitials}
                        </Avatar>
                        <Box>
                            <Typography sx={detailLabelSx}>
                                Assigned
                            </Typography>
                            <Typography sx={detailValueSx}>
                                {ticket.assigned_to_details?.first_name || 'Unassigned'}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" sx={pushRightSx}>
                         <Box sx={ticketsBasicCardBoxSx2}>
                            <Typography sx={detailLabelSx}>
                                Due date
                            </Typography>
                            <Typography sx={detailValueSx}>
                                {ticket.target_date ? formatDate(ticket.target_date) : "N/A"}
                            </Typography>
                        </Box>
                        <Chip
                            label={ticket.priority || 'Normal'}
                            size="small"
                            sx={ticketsBasicCardDynamicDynamicChipSx1({ alpha, styles })}
                        />
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}
