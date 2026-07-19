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
