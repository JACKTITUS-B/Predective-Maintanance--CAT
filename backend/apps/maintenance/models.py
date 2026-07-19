import uuid
from django.db import models
from django.conf import settings
from apps.machinery.models import Machine


class MaintenanceTeam(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    lead = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name="led_maintenance_teams",
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="MaintenanceTeamMember",
        related_name="maintenance_teams",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "maintenance_teams"

    def __str__(self):
        return self.name


class MaintenanceTeamMember(models.Model):
    # Explicit through model to enforce exact database table layout
    team = models.ForeignKey(
        MaintenanceTeam, on_delete=models.CASCADE, db_column="team_id"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="user_id"
    )

    class Meta:
        db_table = "maintenance_team_members"
        unique_together = (("team", "user"),)

    def __str__(self):
        return f"{self.user.username} in {self.team.name}"


class ServiceTeam(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    lead = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name="led_service_teams",
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="ServiceTeamMember",
        related_name="service_teams",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "service_teams"

    def __str__(self):
        return self.name


class ServiceTeamMember(models.Model):
    # Explicit through model to enforce exact database table layout
    team = models.ForeignKey(
        ServiceTeam, on_delete=models.CASCADE, db_column="team_id"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="user_id"
    )

    class Meta:
        db_table = "service_team_members"
        unique_together = (("team", "user"),)

    def __str__(self):
        return f"{self.user.username} in {self.team.name}"


class MaintenanceHistory(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("in-progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    machine = models.ForeignKey(
        Machine, on_delete=models.CASCADE, related_name="maintenance_records"
    )
    team = models.ForeignKey(
        MaintenanceTeam,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="maintenance_records",
    )
    scheduled_date = models.DateField()
    completed_date = models.DateField(blank=True, null=True)
    description = models.TextField()
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="scheduled"
    )
    cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "maintenance_history"
        ordering = ["-scheduled_date"]

    def __str__(self):
        return f"Maint: {self.machine.name} on {self.scheduled_date} ({self.status})"


class ServiceHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    machine = models.ForeignKey(
        Machine, on_delete=models.CASCADE, related_name="service_records"
    )
    team = models.ForeignKey(
        ServiceTeam,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="service_records",
    )
    service_date = models.DateField()
    description = models.TextField()
    parts_replaced = models.JSONField(blank=True, null=True)
    cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "service_history"
        ordering = ["-service_date"]

    def __str__(self):
        return f"Service: {self.machine.name} on {self.service_date}"


class WorkOrder(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    machine_code = models.CharField(max_length=50)
    machine_name = models.CharField(max_length=100)
    site = models.CharField(max_length=100)
    priority = models.CharField(max_length=20)
    assigned_time = models.CharField(max_length=50, blank=True, null=True)
    eta = models.CharField(max_length=50, blank=True, null=True)
    assigned_by = models.CharField(max_length=100, blank=True, null=True)
    problem = models.TextField()
    status = models.CharField(max_length=50, default="Waiting")
    temp = models.FloatField(blank=True, null=True)
    oil_pressure = models.FloatField(blank=True, null=True)
    vibration = models.FloatField(blank=True, null=True)
    hours = models.FloatField(blank=True, null=True)
    rul = models.FloatField(blank=True, null=True)
    failure_prediction = models.CharField(max_length=255, blank=True, null=True)
    required_parts = models.JSONField(default=list, blank=True)
    instructions = models.JSONField(default=list, blank=True)
    engineer_notes = models.TextField(blank=True, null=True, default="")
    images = models.JSONField(default=list, blank=True)
    ai_recommendations = models.JSONField(default=list, blank=True)
    health_before = models.FloatField(blank=True, null=True)
    last_service_date = models.CharField(max_length=50, blank=True, null=True)
    time_generated = models.CharField(max_length=50, blank=True, null=True)
    
    # Inspection additions
    inspection_status = models.CharField(max_length=20, default="NONE")
    service_engineer = models.CharField(max_length=100, blank=True, null=True, default="")
    completion_time = models.CharField(max_length=50, blank=True, null=True)
    status_history = models.JSONField(default=list, blank=True)
    parts_replaced = models.JSONField(default=list, blank=True)
    repair_cost = models.CharField(max_length=50, blank=True, null=True, default="")
    time_taken = models.CharField(max_length=50, blank=True, null=True, default="")
    health_after = models.IntegerField(blank=True, null=True, default=91)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "work_orders"
        ordering = ["created_at"]

    def __str__(self):
        return f"WorkOrder {self.id} - {self.machine_code} - {self.status}"
