from django.test import TestCase
from rest_framework.test import APIClient


class AuthAndAccountFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _register_and_login(self):
        username = "testuser"
        password = "Pass12345"
        self.client.post(
            "/api/auth/register/",
            {"username": username, "email": "test@example.com", "password": password},
            format="json",
        )
        token_response = self.client.post(
            "/api/auth/token/", {"username": username, "password": password}, format="json"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}")

    def test_health_endpoint(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_auth_profile_and_account_creation(self):
        self._register_and_login()

        profile_response = self.client.get("/api/auth/me/")
        self.assertEqual(profile_response.status_code, 200)
        self.assertEqual(profile_response.data["username"], "testuser")

        account_response = self.client.post(
            "/api/accounts/create/", {"initial_deposit": "250.00"}, format="json"
        )
        self.assertEqual(account_response.status_code, 201)
        self.assertEqual(str(account_response.data["balance"]), "250.00")

        me_account_response = self.client.get("/api/accounts/me/")
        self.assertEqual(me_account_response.status_code, 200)
        self.assertEqual(str(me_account_response.data["balance"]), "250.00")

    def test_transactions_and_loans(self):
        self._register_and_login()
        self.client.post("/api/accounts/create/", {"initial_deposit": "100.00"}, format="json")

        deposit_response = self.client.post(
            "/api/transactions/deposit/", {"amount": "50.00"}, format="json"
        )
        self.assertEqual(deposit_response.status_code, 200)

        withdraw_response = self.client.post(
            "/api/transactions/withdraw/", {"amount": "25.00"}, format="json"
        )
        self.assertEqual(withdraw_response.status_code, 200)

        history_response = self.client.get("/api/transactions/history/")
        self.assertEqual(history_response.status_code, 200)
        self.assertGreaterEqual(len(history_response.data), 2)

        loan_apply_response = self.client.post(
            "/api/loans/apply/", {"loan_type": "Business", "amount": "500.00"}, format="json"
        )
        self.assertEqual(loan_apply_response.status_code, 201)

        loans_response = self.client.get("/api/loans/mine/")
        self.assertEqual(loans_response.status_code, 200)
        self.assertEqual(len(loans_response.data), 1)
        self.assertEqual(loans_response.data[0]["status"], "PENDING")
