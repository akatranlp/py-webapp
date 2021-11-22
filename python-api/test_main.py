import asyncio
from typing import Generator
import pytest
from fastapi.testclient import TestClient

from py_api.config import set_config_value

set_config_value('DATABASE_URL', 'sqlite://:memory:')

from main import app

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

