from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal, InvalidOperation
from accounts.models import Account
from .models import Transaction
from .serializers import TransactionSerializer
from django.db import transaction as db_tx


def _parse_amount(value):
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None
    return amount

class DepositView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        amount = _parse_amount(request.data.get("amount", 0))
        if amount is None:
            return Response({"detail": "Invalid amount"}, status=400)

        if amount <= 0:
            return Response({"detail": "Invalid amount"}, status=400)

        with db_tx.atomic():
            account = Account.objects.select_for_update().filter(user=request.user).first()
            if not account:
                return Response({"detail": "No account found"}, status=404)

            account.balance += amount
            account.save()

            Transaction.objects.create(
                account=account,
                transaction_type="DEPOSIT",
                amount=amount
            )

        return Response({"detail": "Deposit successful"}, status=200)


class WithdrawView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        amount = _parse_amount(request.data.get("amount", 0))
        if amount is None:
            return Response({"detail": "Invalid amount"}, status=400)

        if amount <= 0:
            return Response({"detail": "Invalid amount"}, status=400)

        with db_tx.atomic():
            account = Account.objects.select_for_update().filter(user=request.user).first()
            if not account:
                return Response({"detail": "No account found"}, status=404)

            if account.balance < amount:
                return Response({"detail": "Insufficient balance"}, status=400)

            account.balance -= amount
            account.save()

            Transaction.objects.create(
                account=account,
                transaction_type="WITHDRAW",
                amount=amount
            )

        return Response({"detail": "Withdrawal successful"}, status=200)


class TransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = Account.objects.filter(user=request.user).first()
        if not account:
            return Response({"detail": "No account found"}, status=404)

        transactions = account.transactions.all().order_by("-timestamp")

        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
