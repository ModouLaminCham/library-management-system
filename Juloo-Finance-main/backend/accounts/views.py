from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Account
from rest_framework import status
from .serializers import RegisterSerializer
from decimal import Decimal, InvalidOperation
from django.db import transaction as db_tx
from transactions.models import Transaction


# 🔹 REGISTER USER
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        if User.objects.filter(username=username).exists():
            return Response({"detail": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({"detail": "User created successfully"}, status=status.HTTP_201_CREATED)


# 🔹 CREATE BANK ACCOUNT (after login)
class CreateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        if Account.objects.filter(user=request.user).exists():
            return Response({"detail": "Account already exists"}, status=400)

        initial_deposit = request.data.get("initial_deposit", "0")
        try:
            initial_deposit_amount = Decimal(str(initial_deposit))
        except (InvalidOperation, TypeError, ValueError):
            return Response({"detail": "Invalid initial deposit"}, status=400)

        if initial_deposit_amount < 0:
            return Response({"detail": "Initial deposit cannot be negative"}, status=400)

        with db_tx.atomic():
            account = Account.objects.create(
                user=request.user,
                balance=initial_deposit_amount,
            )

            if initial_deposit_amount > 0:
                Transaction.objects.create(
                    account=account,
                    transaction_type="DEPOSIT",
                    amount=initial_deposit_amount,
                )

        return Response({
            "account_number": str(account.account_number),
            "balance": account.balance
        }, status=201)


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            }
        )


# 🔹 GET MY ACCOUNT DETAILS
class MyAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        account = Account.objects.filter(user=request.user).first()

        if not account:
            return Response({"detail": "No account found"}, status=404)

        return Response({
            "account_number": str(account.account_number),
            "balance": account.balance,
            "created_at": account.created_at
        })
