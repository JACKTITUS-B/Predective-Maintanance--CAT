from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    Model viewset for Notifications.
    - Read/Write restricted to user's own notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ["title", "message"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        # Enforce that a user only sees their own notifications
        return Notification.objects.filter(user=self.request.user).select_related("user", "alert")

    def perform_create(self, serializer):
        # Automatically assign user to currently authenticated user if not specified
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], url_path="read")
    def mark_as_read(self, request, pk=None):
        """
        Mark a specific notification as read.
        """
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"detail": "Notification marked as read."})

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        """
        Mark all notifications for the authenticated user as read.
        """
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"detail": "All notifications marked as read."})
