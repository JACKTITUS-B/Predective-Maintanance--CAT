from rest_framework import serializers
from .models import Site, Machine


class SiteSerializer(serializers.ModelSerializer):
    manager_email = serializers.EmailField(source="manager.email", read_only=True)
    manager_name = serializers.CharField(source="manager.username", read_only=True)

    class Meta:
        model = Site
        fields = [
            "id",
            "name",
            "location",
            "manager",
            "manager_name",
            "manager_email",
            "created_at",
            "updated_at",
        ]


class MachineSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source="site.name", read_only=True)

    class Meta:
        model = Machine
        fields = [
            "id",
            "site",
            "site_name",
            "name",
            "model",
            "serial_number",
            "status",
            "purchase_date",
            "created_at",
            "updated_at",
        ]
