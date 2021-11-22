import asyncio
from typing import Generator
import pytest
from fastapi.testclient import TestClient

from py_api.config import set_config_value
from main_generate_random_string import get_random_string

set_config_value('DATABASE_URL', 'sqlite://:memory:')

jwt_access_secret = get_random_string(128)
jwt_refresh_secret = get_random_string(128)
set_config_value('JWT_ACCESS_TOKEN_SECRET', jwt_access_secret)
set_config_value('JWT_REFRESH_TOKEN_SECRET', jwt_refresh_secret)

from main import app
from py_api.models import models_user


@pytest.fixture(scope="module")
def client() -> Generator:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def event_loop(client: TestClient) -> Generator:
    yield asyncio.get_event_loop()


def test_read_main(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {'success': True, 'message': 'Hello World'}


def test_read_users(client: TestClient):
    response = client.get("/users")
    assert response.status_code == 200
    assert response.json() == []


def test_create_user(client: TestClient, event_loop: asyncio.AbstractEventLoop):
    response = client.post("/users", json={"username": "Test", "email": "test@test.com", "password_hash": "test"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["username"] == "Test", data["email"] == "test@test.com"
    assert "id" in data
    user_id = data["id"]

    async def get_user_by_db():
        user = await models_user.User.get(id=user_id)
        return user

    user_obj = event_loop.run_until_complete(get_user_by_db())
    assert user_obj.id == user_id
