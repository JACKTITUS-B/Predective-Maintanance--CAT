from rest_framework import serializers
from .models import (
    MaintenanceTeam,
    ServiceTeam,
    MaintenanceHistory,
    ServiceHistory,
    WorkOrder,
)


class MaintenanceTeamSerializer(serializers.ModelSerializer):
    lead_email = serializers.EmailField(source="lead.email", read_only=True)
    lead_name = serializers.CharField(source="lead.username", read_only=True)

    class Meta:
        model = MaintenanceTeam
        fields = ["id", "name", "lead", "lead_name", "lead_email", "created_at"]


class ServiceTeamSerializer(serializers.ModelSerializer):
    lead_email = serializers.EmailField(source="lead.email", read_only=True)
    lead_name = serializers.CharField(source="lead.username", read_only=True)

    class Meta:
        model = ServiceTeam
        fields = ["id", "name", "lead", "lead_name", "lead_email", "created_at"]


class MaintenanceHistorySerializer(serializers.ModelSerializer):
    machine_name = serializers.CharField(source="machine.name", read_only=True)
    team_name = serializers.CharField(source="team.name", read_only=True)

    class Meta:
        model = MaintenanceHistory
        fields = [
            "id",
            "machine",
            "machine_name",
            "team",
            "team_name",
            "scheduled_date",
            "completed_date",
            "description",
            "status",
            "cost",
            "created_at",
        ]


class ServiceHistorySerializer(serializers.ModelSerializer):
    machine_name = serializers.CharField(source="machine.name", read_only=True)
    team_name = serializers.CharField(source="team.name", read_only=True)

    class Meta:
        model = ServiceHistory
        fields = [
            "id",
            "machine",
            "machine_name",
            "team",
            "team_name",
            "service_date",
            "description",
            "parts_replaced",
            "cost",
            "created_at",
        ]


class WorkOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkOrder
        fields = "__all__"
