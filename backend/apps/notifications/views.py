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


from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Message
from .serializers import MessageSerializer

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Message.objects.none()
        
        # If Super Admin, they see all messages
        if user.role and user.role.name == "Super Admin":
            return Message.objects.all().select_related("sender", "recipient").order_by("created_at")
            
        # Return messages involving the user by object or email, or matching their assigned site
        if user.assigned_site:
            return Message.objects.filter(
                Q(sender=user) |
                Q(recipient=user) |
                Q(sender__email__iexact=user.email) |
                Q(recipient__email__iexact=user.email) |
                Q(site__icontains=user.assigned_site)
            ).select_related("sender", "recipient").order_by("created_at")
            
        return Message.objects.filter(
            Q(sender=user) | Q(recipient=user) | Q(sender__email__iexact=user.email) | Q(recipient__email__iexact=user.email)
        ).select_related("sender", "recipient").order_by("created_at")

    def perform_create(self, serializer):
        User = get_user_model()
        recipient_id = self.request.data.get("recipient")
        recipient_email = self.request.data.get("recipient_email")
        
        recipient_user = None

        if recipient_id:
            try:
                recipient_user = User.objects.filter(id=recipient_id).first()
            except Exception:
                pass

        if not recipient_user and recipient_email:
            recipient_user = User.objects.filter(email__iexact=recipient_email).first()

        if not recipient_user:
            recipient_user = User.objects.filter(role__name="Super Admin").first() or User.objects.filter(is_superuser=True).first()

        serializer.save(sender=self.request.user, recipient=recipient_user)
