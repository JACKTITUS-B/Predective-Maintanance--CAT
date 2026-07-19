from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MaintenanceTeamViewSet,
    ServiceTeamViewSet,
    MaintenanceHistoryViewSet,
    ServiceHistoryViewSet,
    WorkOrderViewSet,
)

router = DefaultRouter()
router.register(r"maintenance-teams", MaintenanceTeamViewSet, basename="maintenance-teams")
router.register(r"service-teams", ServiceTeamViewSet, basename="service-teams")
router.register(r"maintenance-history", MaintenanceHistoryViewSet, basename="maintenance-history")
router.register(r"service-history", ServiceHistoryViewSet, basename="service-history")
router.register(r"work-orders", WorkOrderViewSet, basename="work-orders")

urlpatterns = [
    path("", include(router.urls)),
]
