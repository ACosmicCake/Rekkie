import pytest
from fastapi.testclient import TestClient

# The test_db fixture is used to set up and tear down the test database
# The client fixture provides a TestClient instance for making requests
def test_create_user_success(client: TestClient, test_db):
    response = client.post(
        "/users/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "user_id" in data
    assert "password_hash" not in data

def test_create_user_duplicate_email(client: TestClient, test_db):
    # First, create a user
    client.post(
        "/users/register",
        json={"username": "testuser2", "email": "test2@example.com", "password": "password123"},
    )
    # Then, try to create another user with the same email
    response = client.post(
        "/users/register",
        json={"username": "testuser3", "email": "test2@example.com", "password": "password456"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_success(client: TestClient, test_db):
    # First, create a user to log in with
    client.post(
        "/users/register",
        json={"username": "loginuser", "email": "login@example.com", "password": "password123"},
    )
    response = client.post(
        "/users/token",
        data={"username": "loginuser", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient, test_db):
    # First, create a user
    client.post(
        "/users/register",
        json={
            "username": "wrongpassuser",
            "email": "wrongpass@example.com",
            "password": "password123",
        },
    )
    response = client.post(
        "/users/token",
        data={"username": "wrongpassuser", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_login_nonexistent_user(client: TestClient, test_db):
    response = client.post(
        "/users/token",
        data={"username": "nosuchuser", "password": "password123"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"
