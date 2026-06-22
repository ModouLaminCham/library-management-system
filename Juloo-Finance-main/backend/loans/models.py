from django.db import models
from accounts.models import Account
from decimal import Decimal


class Loan(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
        ("ACTIVE", "Active"),
        ("CLOSED", "Closed"),
    )

    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="loans")
    loan_type = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    duration_months = models.IntegerField(default=12)
    collateral = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    total_repayment = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    remaining_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto calculate total repayment and remaining balance on save
        interest = self.amount * (self.interest_rate / Decimal("100"))
        self.total_repayment = self.amount + interest
        if self.remaining_balance == 0:
            self.remaining_balance = self.total_repayment
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.loan_type} - {self.amount} - {self.status}"


class Repayment(models.Model):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name="repayments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Repayment of {self.amount} for Loan {self.loan.id}"