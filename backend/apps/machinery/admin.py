from django.contrib import admin
from .models import Site, Machine


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ["name", "location", "manager", "created_at"]
    search_fields = ["name", "location"]


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ["name", "model", "serial_number", "site", "status", "purchase_date"]
    list_filter = ["status", "site", "model"]
    search_fields = ["name", "serial_number", "model"]
