from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def health_check(_request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check),

    # AUTH
    path("api/auth/token/", TokenObtainPairView.as_view()),
    path("api/auth/refresh/", TokenRefreshView.as_view()),

    # REGISTER + PROFILE
    path("api/auth/", include("accounts.auth_urls")),
    path("api/accounts/", include("accounts.account_urls")),


    # TRANSACTIONS
    path("api/transactions/", include("transactions.urls")),

    # LOANS
    path("api/loans/", include("loans.urls")),

]
