from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class UserManagementDeleteTests(APITestCase):
	def setUp(self):
		user_model = get_user_model()
		self.admin = user_model.objects.create_user(
			username="admin",
			email="admin@example.com",
			password="password123",
			role="admin",
		)
		self.user_one = user_model.objects.create_user(
			username="user_one",
			email="user_one@example.com",
			password="password123",
			role="user",
		)
		self.user_two = user_model.objects.create_user(
			username="user_two",
			email="user_two@example.com",
			password="password123",
			role="user",
		)
		self.client.force_authenticate(user=self.admin)

	def test_delete_single_user_keeps_other_users(self):
		response = self.client.delete(f"/api/auth/users/{self.user_one.id}/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertFalse(get_user_model().objects.filter(id=self.user_one.id).exists())
		self.assertTrue(get_user_model().objects.filter(id=self.user_two.id).exists())
		self.assertTrue(get_user_model().objects.filter(id=self.admin.id).exists())

	def test_delete_without_user_id_is_rejected(self):
		response = self.client.delete("/api/auth/users/")

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
