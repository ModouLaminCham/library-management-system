from django.urls import path
from .views import RegisterView, MyAccountView, CreateAccountView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MyAccountView.as_view(), name="my-account"),
    path("create/", CreateAccountView.as_view(), name="create-account"),

]
