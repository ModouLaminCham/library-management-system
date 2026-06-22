from django.urls import path
from .views import ApplyLoanView, MyLoansView, RepayLoanView

urlpatterns = [
    path("apply/", ApplyLoanView.as_view()),
    path("my-loans/", MyLoansView.as_view()),
    path("<int:loan_id>/repay/", RepayLoanView.as_view()),
]