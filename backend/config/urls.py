from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/machinery/", include("apps.machinery.urls")),
    path("api/telemetry/", include("apps.telemetry.urls")),
    path("api/maintenance/", include("apps.maintenance.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
]
