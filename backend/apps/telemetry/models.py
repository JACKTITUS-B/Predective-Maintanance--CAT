import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.machinery.models import Machine


class SensorData(models.Model):
    # Django does not natively support composite primary keys. 
    # We define a BigAutoField surrogate key for Django ORM, and enforce uniqueness in metadata.
    id = models.BigAutoField(primary_key=True)
    machine = models.ForeignKey(
        Machine, on_delete=models.CASCADE, related_name="sensor_data"
    )
    timestamp = models.DateTimeField()
    temperature = models.FloatField(blank=True, null=True)
    vibration = models.FloatField(blank=True, null=True)
    pressure = models.FloatField(blank=True, null=True)
    voltage = models.FloatField(blank=True, null=True)
    speed = models.FloatField(blank=True, null=True)
    extra_data = models.JSONField(blank=True, null=True)

    class Meta:
        db_table = "sensor_data"
        unique_together = (("machine", "timestamp"),)
        ordering = ["-timestamp"]

    def __str__(self):
        return f"SensorData {self.machine.name} @ {self.timestamp}"


class Prediction(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending Review"),
        ("confirmed", "Confirmed"),
        ("dismissed", "Dismissed"),
        ("acted", "Acted Upon"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    machine = models.ForeignKey(
        Machine, on_delete=models.CASCADE, related_name="predictions"
    )
    prediction_timestamp = models.DateTimeField(auto_now_add=True)
    predicted_failure_time = models.DateTimeField(blank=True, null=True)
    probability = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    anomaly_score = models.FloatField(blank=True, null=True)
    failure_mode = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "predictions"
        ordering = ["-prediction_timestamp"]

    def __str__(self):
        return f"Prediction {self.machine.name} - Fail Prob: {self.probability:.2f} ({self.status})"


class Alert(models.Model):
    SEVERITY_CHOICES = [
        ("info", "Info"),
        ("warning", "Warning"),
        ("critical", "Critical"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("acknowledged", "Acknowledged"),
        ("resolved", "Resolved"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    machine = models.ForeignKey(
        Machine, on_delete=models.CASCADE, related_name="alerts"
    )
    prediction = models.ForeignKey(
        Prediction,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="triggered_alerts",
    )
    severity = models.CharField(
        max_length=20, choices=SEVERITY_CHOICES, default="warning"
    )
    message = models.TextField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="active"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "alerts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Alert {self.severity.upper()} - {self.machine.name} - {self.status}"
