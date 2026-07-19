import uuid
from django.db import models
from django.conf import settings


class Site(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255, blank=True, null=True)
    # One Site has exactly one Site Manager, and each User manages at most one Site
    manager = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name="managed_site",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sites"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Machine(models.Model):
    STATUS_CHOICES = [
        ("operational", "Operational"),
        ("warning", "Warning"),
        ("critical", "Critical"),
        ("maintenance", "Under Maintenance"),
        ("offline", "Offline"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    site = models.ForeignKey(
        Site, on_delete=models.CASCADE, related_name="machines"
    )
    name = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, unique=True)
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="operational"
    )
    purchase_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "machines"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.serial_number}) - {self.status}"
