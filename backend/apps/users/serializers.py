from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Role

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "description"]


class CustomUserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "name",
            "assigned_site",
            "role",
            "created_at",
            "updated_at",
        ]


class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role_id = serializers.UUIDField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role_id",
        ]

    def create(self, validated_data):
        role_id = validated_data.pop("role_id", None)
        role = None
        if role_id:
            try:
                role = Role.objects.get(id=role_id)
            except Role.DoesNotExist:
                raise serializers.ValidationError({"role_id": "Role does not exist."})
        
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=role,
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Inject custom claims
        token["username"] = user.username
        token["email"] = user.email
        token["name"] = user.name
        token["role"] = user.role.name if user.role else None
        token["assigned_site"] = user.assigned_site
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Custom login response data
        data["user"] = CustomUserSerializer(self.user).data
        return data
