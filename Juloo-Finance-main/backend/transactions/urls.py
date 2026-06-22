from django.urls import path
from .views import DepositView, WithdrawView, TransactionHistoryView

urlpatterns = [
    path("deposit/", DepositView.as_view()),
    path("withdraw/", WithdrawView.as_view()),
    path("history/", TransactionHistoryView.as_view()),
]
