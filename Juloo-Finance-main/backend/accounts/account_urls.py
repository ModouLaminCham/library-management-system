from django.urls import path
from .views import MyAccountView, CreateAccountView

urlpatterns = [
    path("me/", MyAccountView.as_view(), name="my-account"),
    path("create/", CreateAccountView.as_view(), name="create-account"),
]
