from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Account

# 🔐 REGISTER SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"]
        )
        return user


# 🏦 ACCOUNT SERIALIZER
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ["account_number", "balance", "created_at"]
