from decimal import Decimal, InvalidOperation
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import Account
from .models import Loan, Repayment
from .serializers import LoanSerializer, RepaymentSerializer


class ApplyLoanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        account = Account.objects.filter(user=request.user).first()
        if not account:
            return Response({"detail": "No account found"}, status=404)

        # Check for existing active loan
        active_loan = account.loans.filter(status="ACTIVE").exists()
        if active_loan:
            return Response({"detail": "You already have an active loan"}, status=400)

        loan_type = str(request.data.get("loan_type", "")).strip()
        if not loan_type:
            return Response({"detail": "Loan type is required"}, status=400)

        try:
            amount = Decimal(str(request.data.get("amount", 0)))
        except (InvalidOperation, TypeError, ValueError):
            return Response({"detail": "Invalid amount"}, status=400)

        if amount <= 0:
            return Response({"detail": "Amount must be greater than zero"}, status=400)

        # Loan limit check
        if amount > 50000:
            return Response({"detail": "Loan exceeds maximum limit of 50,000"}, status=400)

        duration_months = request.data.get("duration_months", 12)
        collateral = str(request.data.get("collateral", "")).strip()

        try:
            duration_months = int(duration_months)
        except (TypeError, ValueError):
            return Response({"detail": "Invalid duration"}, status=400)

        loan = Loan.objects.create(
            account=account,
            loan_type=loan_type,
            amount=amount,
            duration_months=duration_months,
            collateral=collateral,
        )
        serializer = LoanSerializer(loan)
        return Response(serializer.data, status=201)


class MyLoansView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = Account.objects.filter(user=request.user).first()
        if not account:
            return Response([], status=200)

        loans = account.loans.all().order_by("-created_at")
        serializer = LoanSerializer(loans, many=True)
        return Response(serializer.data)


class RepayLoanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, loan_id):
        account = Account.objects.filter(user=request.user).first()
        if not account:
            return Response({"detail": "No account found"}, status=404)

        try:
            loan = account.loans.get(id=loan_id)
        except Loan.DoesNotExist:
            return Response({"detail": "Loan not found"}, status=404)

        if loan.status != "ACTIVE":
            return Response({"detail": "Only active loans can be repaid"}, status=400)

        try:
            amount = Decimal(str(request.data.get("amount", 0)))
        except (InvalidOperation, TypeError, ValueError):
            return Response({"detail": "Invalid amount"}, status=400)

        if amount <= 0:
            return Response({"detail": "Amount must be greater than zero"}, status=400)

        if amount > loan.remaining_balance:
            return Response({"detail": "Amount exceeds remaining balance"}, status=400)

        # Record repayment
        Repayment.objects.create(loan=loan, amount=amount)

        # Update remaining balance
        loan.remaining_balance -= amount

        # Close loan if fully paid
        if loan.remaining_balance <= 0:
            loan.remaining_balance = Decimal("0")
            loan.status = "CLOSED"

        loan.save()
        serializer = LoanSerializer(loan)
        return Response(serializer.data)