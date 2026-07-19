from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegisterUserView,
    LogoutView,
    UserProfileView,
    RoleViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register(r"roles", RoleViewSet, basename="roles")
router.register(r"users", UserViewSet, basename="users")

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="token_logout"),
    path("register/", RegisterUserView.as_view(), name="auth_register"),
    path("me/", UserProfileView.as_view(), name="auth_me"),
    path("", include(router.urls)),
]
