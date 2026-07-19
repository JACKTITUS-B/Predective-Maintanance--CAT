from django.contrib import admin
from .models import SensorData, Prediction, Alert


@admin.register(SensorData)
class SensorDataAdmin(admin.ModelAdmin):
    list_display = ["machine", "timestamp", "temperature", "vibration", "pressure"]
    list_filter = ["machine", "timestamp"]
    search_fields = ["machine__name"]


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ["machine", "probability", "anomaly_score", "failure_mode", "status", "prediction_timestamp"]
    list_filter = ["status", "machine", "failure_mode"]
    search_fields = ["machine__name", "failure_mode"]


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ["machine", "severity", "status", "created_at", "resolved_at"]
    list_filter = ["severity", "status", "machine"]
    search_fields = ["machine__name", "message"]
