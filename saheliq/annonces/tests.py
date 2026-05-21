from django.test import TestCase

# Create your tests here.
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Annonce


class AuthTests(APITestCase):
    def test_register_user(self):
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "password2": "testpass123"
        }
        response = self.client.post("/api/register/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_login_user(self):
        User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")
        response = self.client.post("/api/login/", {
            "username": "testuser",
            "password": "testpass123"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)


class AnnonceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", email="owner@test.com", password="testpass123")
        login = self.client.post("/api/login/", {
            "username": "owner",
            "password": "testpass123"
        })
        self.token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_create_annonce(self):
        data = {
            "titre": "Appartement Alger",
            "description": "Bel appartement",
            "type_bien": "Appartement",
            "superficie": 100,
            "nombre_pieces": 3,
            "prix": 12000000,
            "ville": "Alger"
        }
        response = self.client.post("/api/annonces/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_my_annonces(self):
        Annonce.objects.create(
            titre="Test",
            description="Desc",
            type_bien="Appartement",
            superficie=90,
            nombre_pieces=3,
            prix=1000000,
            ville="Oran",
            proprietaire=self.user
        )
        response = self.client.get("/api/my-annonces/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)