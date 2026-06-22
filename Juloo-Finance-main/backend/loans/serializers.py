from rest_framework import serializers
from .models import Loan, Repayment


class RepaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repayment
        fields = ["id", "amount", "paid_at"]


class LoanSerializer(serializers.ModelSerializer):
    repayments = RepaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Loan
        fields = [
            "id",
            "loan_type",
            "amount",
            "interest_rate",
            "duration_months",
            "collateral",
            "status",
            "total_repayment",
            "remaining_balance",
            "created_at",
            "repayments",
        ]