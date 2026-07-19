from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SensorDataViewSet, PredictionViewSet, AlertViewSet

router = DefaultRouter()
router.register(r"sensor-data", SensorDataViewSet, basename="sensor-data")
router.register(r"predictions", PredictionViewSet, basename="predictions")
router.register(r"alerts", AlertViewSet, basename="alerts")

urlpatterns = [
    path("", include(router.urls)),
]
