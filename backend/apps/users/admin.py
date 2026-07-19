from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Role, CustomUser


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ["email", "username", "role", "is_staff", "is_active", "created_at"]
    list_filter = ["role", "is_staff", "is_active"]
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["email"]


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Role)
