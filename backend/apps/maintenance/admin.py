from django.contrib import admin
from .models import (
    MaintenanceTeam,
    MaintenanceTeamMember,
    ServiceTeam,
    ServiceTeamMember,
    MaintenanceHistory,
    ServiceHistory,
)


class MaintenanceTeamMemberInline(admin.TabularInline):
    model = MaintenanceTeamMember
    extra = 1


class ServiceTeamMemberInline(admin.TabularInline):
    model = ServiceTeamMember
    extra = 1


@admin.register(MaintenanceTeam)
class MaintenanceTeamAdmin(admin.ModelAdmin):
    list_display = ["name", "lead", "created_at"]
    search_fields = ["name"]
    inlines = [MaintenanceTeamMemberInline]


@admin.register(ServiceTeam)
class ServiceTeamAdmin(admin.ModelAdmin):
    list_display = ["name", "lead", "created_at"]
    search_fields = ["name"]
    inlines = [ServiceTeamMemberInline]


@admin.register(MaintenanceHistory)
class MaintenanceHistoryAdmin(admin.ModelAdmin):
    list_display = ["machine", "team", "scheduled_date", "completed_date", "status", "cost"]
    list_filter = ["status", "team", "machine"]
    search_fields = ["machine__name", "description"]


@admin.register(ServiceHistory)
class ServiceHistoryAdmin(admin.ModelAdmin):
    list_display = ["machine", "team", "service_date", "cost"]
    list_filter = ["team", "machine"]
    search_fields = ["machine__name", "description"]
