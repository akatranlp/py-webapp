import asyncio
from typing import Generator
import pytest
from fastapi.testclient import TestClient

from py_api.config import set_config_value
from main_generate_random_string import get_random_string

# import os
# os.remove('test_db.sqllite3')

# set_config_value('DATABASE_URL', 'sqlite://test_db.sqllite3')
set_config_value('DATABASE_URL', 'sqlite://:memory:')

jwt_access_secret = get_random_string(128)
jwt_refresh_secret = get_random_string(128)
set_config_value('JWT_ACCESS_TOKEN_SECRET', jwt_access_secret)
set_config_value('JWT_REFRESH_TOKEN_SECRET', jwt_refresh_secret)

from main import app
from py_api.models import models_user


@pytest.fixture(scope='module')
def test_user() -> Generator:
    yield {
        'id': None,
        'username': 'Test',
        'password': get_random_string(32),
        'password_hash': None,
        'email': 'test@test.com'
    }


@pytest.fixture(scope='module')
def admin_user() -> Generator:
    yield {
        'id': None,
        'username': 'adminTest',
        'password': get_random_string(32),
        'password_hash': None,
        'email': 'admin@test.com'
    }


@pytest.fixture(scope='module')
def client() -> Generator:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope='module')
def event_loop(client: TestClient) -> Generator:
    yield asyncio.get_event_loop()


def test_read_main(client: TestClient):
    response = client.get('/')
    assert response.status_code == 200
    assert response.json() == {'success': True, 'message': 'Hello World'}


def test_read_users(client: TestClient):
    response = client.get('/users')
    assert response.status_code == 200
    assert response.json() == []


def create_user(client: TestClient, user: dict):
    response = client.post('/users', json={'username': user['username'], 'email': user['email'],
                                           'password_hash': user['password']})
    assert response.status_code == 200, response.text
    data = response.json()
    assert data['username'] == user['username'], data['email'] == user['email']
    assert 'id' in data
    user['id'] = data['id']
    assert 'password_hash' in data
    user['password_hash'] = data['password_hash']


def test_create_user(client: TestClient, event_loop: asyncio.AbstractEventLoop, test_user: dict):
    create_user(client, test_user)

    async def get_user_by_db():
        user = await models_user.User.get(id=test_user['id'])
        return user

    user_obj = event_loop.run_until_complete(get_user_by_db())
    assert user_obj.id == test_user['id']


def test_create_admin(client: TestClient, event_loop: asyncio.AbstractEventLoop, admin_user: dict):
    create_user(client, admin_user)

    async def change_to_admin_and_return():
        user = await models_user.User.get(id=admin_user['id'])
        user.is_admin = True
        await user.save()
        return user

    user_obj: models_user.User = event_loop.run_until_complete(change_to_admin_and_return())
    assert user_obj.id == admin_user['id']
    assert user_obj.is_admin
