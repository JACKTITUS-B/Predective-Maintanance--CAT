import uuid
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)


class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.VARCHAR = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "roles"

    def __str__(self):
        return self.name


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, role=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        if not username:
            raise ValueError("The Username field must be set")

        email = self.normalize_email(email)
        
        # If no role provided, assign Operator by default or let it be null (if nullable)
        if not role:
            try:
                role = Role.objects.get(name="Operator")
            except Role.DoesNotExist:
                pass

        user = self.model(
            username=username, email=email, role=role, **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        # Superuser role setup
        super_admin_role, _ = Role.objects.get_or_create(
            name="Super Admin",
            defaults={"description": "Platform owner with root permissions"}
        )
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(
            username=username,
            email=email,
            password=password,
            role=super_admin_role,
            **extra_fields
        )


class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    assigned_site = models.CharField(max_length=100, blank=True, null=True)
    role = models.ForeignKey(
        Role, on_delete=models.RESTRICT, related_name="users", null=True, blank=True
    )
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.email} ({self.role.name if self.role else 'No Role'})"
