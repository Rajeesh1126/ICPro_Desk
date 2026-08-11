from django.utils.html import format_html

def ticketCreateEmailBody(
    recipient,
    Heading,
    content,
    ticket_number,
    ticket_creator,
    task,
    description,
    priority,
    est_start_date,
    target_date,
    est_work_hours,
    department,
    assigned_to,
    remarks,
    ticket_url="https://home.icpro.in/tms/",
):
    """Generate a professional HTML email for a newly created ticket."""

    priority_key = str(priority or "").strip().upper()

    priority_styles = {
        "HIGH": {
            "background": "#FDECEC",
            "color": "#C62828",
            "border": "#F5B7B1",
        },
        "MEDIUM": {
            "background": "#FFF4CC",
            "color": "#8A6500",
            "border": "#F0D675",
        },
        "LOW": {
            "background": "#E8F5E9",
            "color": "#2E7D32",
            "border": "#A5D6A7",
        },
    }

    priority_style = priority_styles.get(
        priority_key,
        {
            "background": "#EEEEEE",
            "color": "#424242",
            "border": "#BDBDBD",
        },
    )

    return format_html(
        """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #F4F6F8;
            font-family: Arial, Helvetica, sans-serif;
            color: #222222;
        ">
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background-color: #F4F6F8; padding: 24px 12px;">
                <tr>
                    <td align="center">

                        <table width="100%" cellpadding="0" cellspacing="0"
                               style="
                                   max-width: 680px;
                                   background-color: #FFFFFF;
                                   border: 1px solid #E0E0E0;
                                   border-radius: 8px;
                                   overflow: hidden;
                               ">

                            <!-- Header -->
                            <tr>
                                <td style="
                                    background-color: #1F4E78;
                                    padding: 22px 28px;
                                    color: #FFFFFF;
                                ">
                                    <div style="
                                        font-size: 22px;
                                        font-weight: bold;
                                        margin-bottom: 6px;
                                    ">
                                        {}
                                    </div>

                                </td>
                            </tr>

                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 28px;">

                                    <p style="
                                        margin: 0 0 16px;
                                        font-size: 15px;
                                        line-height: 1.6;
                                    ">
                                        Hi <strong>{}</strong>,
                                    </p>

                                    <p style="
                                        margin: 0 0 22px;
                                        font-size: 15px;
                                        line-height: 1.6;
                                        color: #444444;
                                    ">
                                        {}
                                    </p>

                                    <!-- Important Summary -->
                                    <table width="100%" cellpadding="0" cellspacing="0"
                                           style="
                                               margin-bottom: 22px;
                                               background-color: #F5F9FD;
                                               border-left: 4px solid #1F4E78;
                                               border-radius: 4px;
                                           ">
                                        <tr>
                                            <td style="padding: 16px 18px;">
                                                <div style="
                                                    font-size: 13px;
                                                    color: #607D8B;
                                                    margin-bottom: 5px;
                                                ">
                                                    Ticket Number
                                                </div>

                                                <div style="
                                                    font-size: 20px;
                                                    font-weight: bold;
                                                    color: #1F4E78;
                                                ">
                                                    {}
                                                </div>
                                            </td>

                                            <td align="right" style="padding: 16px 18px;">
                                                <span style="
                                                    display: inline-block;
                                                    padding: 7px 14px;
                                                    border-radius: 20px;
                                                    font-size: 12px;
                                                    font-weight: bold;
                                                    letter-spacing: 0.4px;
                                                    background-color: {};
                                                    color: {};
                                                    border: 1px solid {};
                                                ">
                                                    {} PRIORITY
                                                </span>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Ticket Details -->
                                    <div style="
                                        margin-bottom: 12px;
                                        font-size: 16px;
                                        font-weight: bold;
                                        color: #1F4E78;
                                    ">
                                        Ticket Details
                                    </div>

                                    <table width="100%" cellpadding="0" cellspacing="0"
                                           style="
                                               border-collapse: collapse;
                                               font-size: 14px;
                                               margin-bottom: 24px;
                                           ">

                                        <tr>
                                            <td style="{}">Task</td>
                                            <td style="{}"><strong>{}</strong></td>
                                        </tr>

                                        <tr>
                                            <td style="{}">Description</td>
                                            <td style="{}">{}</td>
                                        </tr>

                                        <tr>
                                            <td style="{}">Created By</td>
                                            <td style="{}"><strong>{}</strong></td>
                                        </tr>

                                        <tr>
                                            <td style="{}">Department To</td>
                                            <td style="{}"><strong>{}</strong></td>
                                        </tr>

                                        <tr>
                                            <td style="{}">Assigned To</td>
                                            <td style="{}"><strong>{}</strong></td>
                                        </tr>

                                        <tr>
                                            <td style="{}">Estimated Start Date</td>
                                            <td style="{}"><strong>{}</strong></td>
                                        </tr>

                                        <tr>
                                            <td style="{}">Target Completion Date</td>
                                            <td style="{}"><strong>{}</strong></td>
                                        </tr>

                                        <tr>
                                            <td style="{}">Estimated Work Hours</td>
                                            <td style="{}"><strong>{}</strong></td>
                                        </tr>

                                        <tr>
                                            <td style="{}">Remarks</td>
                                            <td style="{}">{}</td>
                                        </tr>
                                    </table>

                                    <!-- Action Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center">
                                                <a href="{}"
                                                   style="
                                                       display: inline-block;
                                                       padding: 12px 24px;
                                                       background-color: #1F4E78;
                                                       color: #FFFFFF;
                                                       text-decoration: none;
                                                       font-size: 14px;
                                                       font-weight: bold;
                                                       border-radius: 5px;
                                                   ">
                                                    View or Update Ticket
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="
                                        margin: 22px 0 0;
                                        font-size: 12px;
                                        line-height: 1.5;
                                        color: #777777;
                                        text-align: center;
                                    ">
                                        You can use the link above to view the ticket
                                        status, review it, update it, or recall it.
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="
                                    padding: 16px 28px;
                                    background-color: #F8F9FA;
                                    border-top: 1px solid #E5E5E5;
                                    font-size: 12px;
                                    line-height: 1.5;
                                    color: #777777;
                                    text-align: center;
                                ">
                                    This is an automated notification.
                                    Please do not reply to this email.
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """,
        Heading or "",
        recipient or "User",
        content or "A new ticket has been created and assigned for your attention.",
        ticket_number or "-",
        priority_style["background"],
        priority_style["color"],
        priority_style["border"],
        priority_key or "NORMAL",

        # Task
        _label_style(),
        _value_style(),
        task or "-",

        # Description
        _label_style(),
        _value_style(),
        description or "-",

        # Created by
        _label_style(),
        _value_style(),
        ticket_creator or "-",

        # Department
        _label_style(),
        _value_style(),
        department or "-",

        # Assigned to
        _label_style(),
        _value_style(),
        assigned_to or "-",

        # Estimated start date
        _label_style(),
        _value_style(),
        est_start_date or "-",

        # Target completion date
        _label_style(),
        _value_style(),
        target_date or "-",

        # Estimated work hours
        _label_style(),
        _value_style(),
        est_work_hours or "-",

        # Remarks
        _label_style(),
        _value_style(),
        remarks or "-",

        ticket_url or "#",
    )


def _label_style():
    return """
        width: 38%;
        padding: 11px 12px;
        border: 1px solid #E5E7EB;
        background-color: #F8F9FA;
        color: #555555;
        font-weight: bold;
        vertical-align: top;
    """


def _value_style():
    return """
        padding: 11px 12px;
        border: 1px solid #E5E7EB;
        color: #222222;
        line-height: 1.5;
        vertical-align: top;
    """