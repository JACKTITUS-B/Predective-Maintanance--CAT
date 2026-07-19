from rest_framework import serializers
from .models import SensorData, Prediction, Alert


class SensorDataSerializer(serializers.ModelSerializer):
    machine_name = serializers.CharField(source="machine.name", read_only=True)

    class Meta:
        model = SensorData
        fields = [
            "id",
            "machine",
            "machine_name",
            "timestamp",
            "temperature",
            "vibration",
            "pressure",
            "voltage",
            "speed",
            "extra_data",
        ]


class PredictionSerializer(serializers.ModelSerializer):
    machine_name = serializers.CharField(source="machine.name", read_only=True)

    class Meta:
        model = Prediction
        fields = [
            "id",
            "machine",
            "machine_name",
            "prediction_timestamp",
            "predicted_failure_time",
            "probability",
            "anomaly_score",
            "failure_mode",
            "status",
            "created_at",
        ]


class AlertSerializer(serializers.ModelSerializer):
    machine_name = serializers.CharField(source="machine.name", read_only=True)

    class Meta:
        model = Alert
        fields = [
            "id",
            "machine",
            "machine_name",
            "prediction",
            "severity",
            "message",
            "status",
            "created_at",
            "resolved_at",
        ]
