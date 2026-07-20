from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_health(request):
    return JsonResponse({
        "status": "ok",
        "service": "Caterpillar Predictive Maintenance API Engine",
        "documentation": "/api/"
    })

def api_health(request):
    return JsonResponse({
        "status": "ok",
        "endpoints": [
            "/api/auth/login/",
            "/api/auth/users/",
            "/api/machinery/sites/",
            "/api/machinery/machines/",
            "/api/machinery/equipments/",
            "/api/machinery/equipment-telemetry/",
            "/api/telemetry/sensor-data/",
            "/api/telemetry/predictions/",
            "/api/telemetry/alerts/",
            "/api/maintenance/work-orders/",
            "/api/notifications/messages/"
        ]
    })

urlpatterns = [
    path("", root_health),
    path("health/", root_health),
    path("api/", api_health),
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/machinery/", include("apps.machinery.urls")),
    path("api/telemetry/", include("apps.telemetry.urls")),
    path("api/maintenance/", include("apps.maintenance.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
]
