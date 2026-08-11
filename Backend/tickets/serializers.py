from rest_framework import serializers
# from django.contrib.auth.models import User
from .models import Ticket, Ticket_Log, Ticket_File, Self_Ticket,Self_Ticket_Log
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from core.emailContents import ticketCreateEmailBody
from core.microsoftGraphAPI import send_mail
from django.utils import timezone
from django.contrib.auth import get_user_model
# from datetime import date


User = get_user_model()

# File Serializer
class TicketFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket_File
        fields = ['id', 'file', 'uploaded_at']

# Log Serializer
class TicketLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.ReadOnlyField(source='changed_by.first_name')

    class Meta:
        model = Ticket_Log
        fields = ['id', 'status', 'changed_by', 'changed_by_name', 'remarks', 'created_at', 'assigned_to']

# Main Ticket Serializer
class TicketSerializer(serializers.ModelSerializer):
    # today = date.today()
    today = timezone.localdate()
    # Read-only nested data for GET requests
    logs = TicketLogSerializer(many=True, read_only=True)
    files = TicketFileSerializer(many=True, read_only=True)
    creator_details = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    assigned_to_details = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    remarks = serializers.CharField(write_only=True,required=False)
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()
    act_hours = serializers.FloatField(read_only=True)
    actual_start_date = serializers.DateField(read_only=True)
    actual_end_date = serializers.DateField(read_only=True)
    work_efficiency = serializers.FloatField(read_only=True)
    schedule_efficiency = serializers.FloatField(read_only=True)
    latest_logremarks = serializers.CharField(read_only=True)
    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    # files
    attachments = serializers.ListField(
                                        child=serializers.FileField(),
                                        write_only=True,
                                        required=False
                                        )

    class Meta:
        model = Ticket
        fields = [
            'id', 'number', 'task', 'description', 'creator', 'creator_details', 'department','department_name',
            'assigned_to', 'assigned_to_details', 'est_hours', 'target_date', 'rating',
            'priority', 'current_status', 'created_at', 'updated_at', 'logs', 'files','attachments',
            'remarks', 'act_hours', 'actual_start_date', 'actual_end_date', 'work_efficiency', 'schedule_efficiency','latest_logremarks'
        ]
        read_only_fields = ['number','creator', 'created_at', 'updated_at']
    # Explicitly convert datetime to date string
    def get_created_at(self, obj):
        return obj.created_at.date() if obj.created_at else None

    def get_updated_at(self, obj):
        return obj.updated_at.date() if obj.updated_at else None
    
    def create(self, validated_data):
        """
        Overriding create to ensure a log is generated when a ticket is first made.
        """
        attachments = validated_data.pop("attachments", [])
        ticket = Ticket.objects.create(**validated_data)
        
        # Create initial log
        Ticket_Log.objects.create(
            ticket=ticket,
            status=ticket.current_status,
            changed_by=ticket.creator,
            remarks="Ticket initialized by " + ticket.creator.first_name,
            assigned_to = ticket.assigned_to
        )

        # Attach files if provided
        for attachment in attachments:
            Ticket_File.objects.create(
                ticket=ticket,
                file=attachment,
            )


        subject = "Ticket Registration - Your ticket with Ticket Id -"+ticket.number
        text_content = "Ticket created"
        content = f"On { self.today.strftime('%d-%m-%Y') } a new ticket with the below data has been created"
        Heading = "New Ticket Created"
        html_content = ticketCreateEmailBody(ticket.assigned_to.first_name,
                                                Heading,
                                                content,
                                                ticket.number,
                                                ticket.creator.first_name,
                                                ticket.task,
                                                ticket.description,
                                                ticket.priority,
                                                ticket.created_at.date().strftime("%d-%m-%Y"),
                                                ticket.target_date.strftime("%d-%m-%Y"),
                                                ticket.est_hours,
                                                ticket.department,
                                                ticket.assigned_to.first_name,
                                                "Ticket is created")
        # send_mail(subject,html_content,[ticket.assigned_to.email])

        return ticket

    def update(self, instance, validated_data):
        old_status = instance.current_status
        new_status = validated_data.get('current_status', old_status)
        validated_data['current_status'] = new_status
        remarks = validated_data.get('remarks')
        assigned_to = validated_data.get('assigned_to')
        # Perform the actual update on the Ticket
        instance = super().update(instance, validated_data)
        
        # Attachments can be added here if needed, for now, we are just sending the email without attachments.
        attachments = validated_data.pop("attachments", [])

        for attachment in attachments:
            Ticket_File.objects.create(
                ticket=instance,
                file=attachment,
            )

        if old_status != new_status or new_status == "in progress" or new_status == "feedback provided":
            # Logic: If authenticated, use that user. If not (Dev Mode), 
            # use User ID 3 as requested.
            user = self.context['request'].user
            if not user or user.is_anonymous:
                try:
                    user = User.objects.get(id=2) 
                except User.DoesNotExist:
                    # Fallback to any user if 3 doesn't exist
                    user = Users.objects.first()

            # Create the log entry
            Ticket_Log.objects.create(
                ticket=instance,
                status=new_status,
                changed_by=user,
                remarks=remarks if remarks else f"Status changed to {new_status}.",
                assigned_to = assigned_to
            )

            Receivermail = ""
            Receivername = ""
            content = ""
            subject = f"Ticket {new_status} - Your ticket with Ticket Id -"+instance.number
            text_content = "Ticket emails"
            Heading = "Ticket Modified"
            today = self.today.strftime('%d-%m-%Y')
            if new_status == "rejected":
                content = f"On { today } the ticket with the below data has been rejected with the reason as mentioned below."
                Receivermail = instance.creator.email
                Receivername = instance.creator.first_name
                Heading = "Ticket Rejected"
            elif new_status == "completed":
                content = f"On { today } the ticket with the below data has been completed."
                Receivermail = instance.creator.email
                Receivername = instance.creator.first_name
                Heading = "Ticket Completed"
            elif new_status == "closed":
                content = f"On { today }  the ticket with the below data has been reviewed and closed. Please find the KPI related with this ticket as attached !"
                Receivermail = instance.assigned_to.email
                Receivername = instance.assigned_to.first_name
                Heading = "Ticket Closed"
            elif new_status == "recall requested":
                content = f"On { today } the ticket with the below data has been Requested to be recalled."
                Receivermail = instance.assigned_to.email
                Receivername = instance.assigned_to.first_name
                Heading = "Recall Requested"
            elif new_status == "recall successful":
                content = f"On { today } the ticket with the below data - Recall has been completed."
                Receivermail = instance.creator.email
                Receivername = instance.creator.first_name
                Heading = "Recall Successful"
            elif new_status == "accepted":
                content = f"On { today } the ticket with the below data has been assigned to {instance.assigned_to.first_name} with the data as mentioned below."
                Receivermail = instance.creator.email
                Receivername = instance.creator.first_name
                Heading = "Ticket Accepted"
            elif new_status == "assigned":
                content = f"On { today } the ticket with the below data - has been Reassigned and status updated to Reassigned and Open."
                Receivermail = instance.creator.email
                Receivername = instance.creator.first_name
                Heading = "Ticket Assigned"
            elif new_status =="not-satisfied":
                content = f"On { today } the ticket with the details below was marked as Not Satisfied."
                Receivermail = instance.assigned_to.email
                Receivername = instance.assigned_to.first_name
                Heading = "Not Satisfied"
            elif new_status =="cancelled":
                content = f"On { today } the ticket with the details below has been cancelled."
                Receivermail = instance.assigned_to.email
                Receivername = instance.assigned_to.first_name
                Heading = "Ticket Cancelled"
            elif new_status =="in progress":
                content = f"On {today}, the progress of the ticket with the details below has been updated. "
                Receivermail = instance.creator.email
                Receivername = instance.creator.first_name
                Heading = "Ticket In Progress"
            elif new_status =="feedback provided":
                content = f"On {today}, the ticket creator has provided feedback on the ticket. Please review the comments below."
                Receivermail = instance.assigned_to.email
                Receivername = instance.assigned_to.first_name
                Heading = "Ticket Feedback Provided"
            else:
                content = f"On { today } the ticket with the below data - has been Modified / Update and status updated to Modified / Updated and Open."
                Receivermail = instance.assigned_to.email
                Receivername = instance.assigned_to.first_name

           
            html_content = ticketCreateEmailBody(Receivername,
                                                    Heading,
                                                    content,
                                                    instance.number,
                                                    instance.creator.first_name,
                                                    instance.task,
                                                    instance.description,
                                                    instance.priority,
                                                    instance.created_at.date().strftime("%d-%m-%Y"),
                                                    instance.target_date.strftime("%d-%m-%Y"),
                                                    instance.est_hours,
                                                    instance.department,
                                                    instance.assigned_to.first_name,
                                                    remarks)
            # send_mail(subject,html_content,[Receivermail])
        else:
            logLatest = Ticket_Log.objects.filter(ticket=instance).latest('created_at')
            logLatest.assigned_to = assigned_to
        return instance

class TicketSummarySerializer(serializers.Serializer):
    total = serializers.IntegerField()
    open = serializers.IntegerField()
    accepted = serializers.IntegerField()
    completed = serializers.IntegerField()

# self log serializer
class SelfTicketLogSerializer(serializers.ModelSerializer):
    creator_name = serializers.ReadOnlyField(source='creator.first_name')

    class Meta:
        model = Self_Ticket_Log
        fields = ['id', 'self_ticket', 'comments', 'creator', 'created_at', 'creator_name']



class SelfTicketSerializer(serializers.ModelSerializer):
    team = serializers.ReadOnlyField()
    team_name = serializers.ReadOnlyField()
    creator_name = serializers.ReadOnlyField()

    reporting_to = serializers.CharField(
        source='creator.profile.reporting_to',
        read_only=True
    )

    logs = SelfTicketLogSerializer(
        source='selfLogs',
        many=True,
        read_only=True
    )

    comments = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = Self_Ticket
        fields = '__all__'
        read_only_fields = [
            'number',
            'creator',
            'created_at',
            'updated_at',
            'reporting_to'
        ]

    def update(self, instance, validated_data):
        comments = validated_data.pop('comments', None)

        instance = super().update(instance, validated_data)

        if comments:
            Self_Ticket_Log.objects.create(
                self_ticket=instance,
                comments=comments,
                creator=self.context['request'].user
            )

        return instance
