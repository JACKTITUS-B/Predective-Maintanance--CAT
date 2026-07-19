from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    alert_message = serializers.CharField(source="alert.message", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "user_email",
            "alert",
            "alert_message",
            "title",
            "message",
            "is_read",
            "created_at",
        ]


from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source="sender.email", read_only=True)
    sender_name = serializers.CharField(source="sender.name", read_only=True)
    recipient_email = serializers.EmailField(source="recipient.email", read_only=True)
    recipient_name = serializers.CharField(source="recipient.name", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "sender_email",
            "sender_name",
            "recipient",
            "recipient_email",
            "recipient_name",
            "site",
            "machine_code",
            "subject",
            "body",
            "is_read",
            "status",
            "created_at",
        ]
        read_only_fields = ["sender"]
