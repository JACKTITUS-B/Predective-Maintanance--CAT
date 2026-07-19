import uuid
from django.db import models
from django.conf import settings
from apps.telemetry.models import Alert


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    alert = models.ForeignKey(
        Alert,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="notifications",
    )
    title = models.CharField(max_length=150)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification for {self.user.email} - Read: {self.is_read}"
