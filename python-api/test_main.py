import asyncio
import time
from typing import Generator
from uuid import UUID, uuid1
import pytest
from fastapi.testclient import TestClient

from py_api.config import Config
from main_generate_random_string import get_random_string

try:
    import os

    os.remove('test_db.sqllite3')
except:
    pass

# Config.get_instance().set_config_value('DATABASE_URL', 'sqlite://test_db.sqlite3')
Config.get_instance().set_config_value('DATABASE_URL', 'sqlite://:memory:')

jwt_access_secret = get_random_string(128)
jwt_refresh_secret = get_random_string(128)
Config.get_instance().set_config_value('JWT_ACCESS_TOKEN_SECRET', jwt_access_secret)
Config.get_instance().set_config_value('JWT_REFRESH_TOKEN_SECRET', jwt_refresh_secret)

from main import app
from py_api.models import models_user, models_event


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
def test_event() -> Generator:
    yield {'uuid': None,
           'system_id': None,
           'created_at': None,
           'updated_at': None,
           'title': 'Test-Termin',
           'start_date': '2021-12-14T14:00:37.000001+00:00',
           'end_date': '2021-12-15T14:00:37.000001+00:00',
           'description': 'Dies ist ein Test Termin!!',
           'location': 'Hochschule Flensburg'}


@pytest.fixture(scope='module')
def client() -> Generator:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope='module')
def event_loop(client: TestClient) -> Generator:
    yield asyncio.get_event_loop()


def test_read_main(client: TestClient):
    response = client.get('/hello-world')
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


def test_already_taken(client: TestClient, event_loop: asyncio.AbstractEventLoop, test_user: dict):
    response = client.post('/users', json={'username': test_user['username'], 'email': 'hello@test.com',
                                           'password_hash': test_user['password']})
    assert response.status_code == 400
    assert response.json() == {'detail': 'Username or Email already taken'}

    response = client.post('/users', json={'username': 'Hello', 'email': test_user['email'],
                                           'password_hash': test_user['password']})
    assert response.status_code == 400
    assert response.json() == {'detail': 'Username or Email already taken'}


def test_not_all_delivered(client: TestClient, event_loop: asyncio.AbstractEventLoop, test_user: dict):
    response = client.post('/users', json={})
    assert response.status_code == 422
    assert response.json() == {
        'detail': [{'loc': ['body', 'username'], 'msg': 'field required', 'type': 'value_error.missing'},
                   {'loc': ['body', 'password_hash'], 'msg': 'field required', 'type': 'value_error.missing'},
                   {'loc': ['body', 'email'], 'msg': 'field required', 'type': 'value_error.missing'}]}


def test_read_users_again(client: TestClient):
    response = client.get('/users')
    assert response.status_code == 200
    assert response.json() == [{'email': 'test@test.com', 'username': 'Test'},
                               {'email': 'admin@test.com', 'username': 'adminTest'}]


def test_unauthorized(client: TestClient):
    response = client.get('/users/me')
    assert response.status_code == 401
    assert response.json() == {'detail': 'Not authenticated'}


def test_does_not_exist(client: TestClient):
    response = client.post('/login', data={'username': 'Hello', 'password': 'hello'})
    assert response.status_code == 404
    assert response.json() == {'detail': 'Object does not exist'}


def login(client: TestClient, user: dict) -> str:
    form = {
        'username': user['username'],
        'password': user['password']
    }

    response = client.post('/login', data=form)
    assert response.status_code == 200
    data = response.json()
    assert data['token_type'] == 'bearer', data['access_token']
    assert len(response.cookies) == 1
    assert len(client.cookies) == 1
    return data['access_token']


def test_login(client: TestClient, test_user: dict):
    assert login(client, test_user)
    client.cookies.clear_session_cookies()
    assert len(client.cookies) == 0


def test_me(client: TestClient, test_user: dict):
    token = login(client, test_user)
    headers = {'Authorization': f'Bearer {token}'}

    response = client.get('/users/me', headers=headers)
    assert response.status_code == 200
    assert response.json() == {'username': test_user['username'], 'email': test_user['email']}
    client.cookies.clear_session_cookies()


def test_invalid_refresh(client: TestClient, test_user: dict):
    response = client.get('/refresh_token')
    assert response.status_code == 401
    assert response.json() == {'detail': 'Refresh Token invalid'}

    response = client.get('/refresh_token', cookies={'jib': 'FalscherToken'})
    assert response.status_code == 401
    assert response.json() == {'detail': 'Refresh Token invalid'}


def test_refresh_token(client: TestClient, test_user: dict):
    token = login(client, test_user)
    assert len(client.cookies) == 1
    assert client.cookies['jib']
    # weil die cookies secure sind können sie nur über https übertragen werden, wegen cors
    # deshalb tricksen wir ein bisschen beim testen und setzen den cookie selber
    cookie = client.cookies['jib']

    time.sleep(1)
    response = client.get('/refresh_token', cookies={'jib': cookie})
    assert response.status_code == 200
    data = response.json()
    assert data['token_type'] == 'bearer', data['access_token']
    assert len(response.cookies) == 1
    assert len(client.cookies) == 1
    assert token != data['access_token']
    assert response.cookies['jib'] != cookie
    client.cookies.clear_session_cookies()


def test_get_user(client: TestClient, test_user: dict, admin_user: dict):
    token = login(client, test_user)
    headers = {'Authorization': f'Bearer {token}'}
    response = client.get('/users/adminTest', headers=headers)

    assert response.status_code == 401
    assert response.json() == {'detail': 'you are not permitted to do that'}
    client.cookies.clear_session_cookies()

    token = login(client, admin_user)
    headers = {'Authorization': f'Bearer {token}'}

    response = client.get('/users/adminTest', headers=headers)
    assert response.status_code == 200
    assert response.json() == {'email': 'admin@test.com', 'username': 'adminTest'}
    client.cookies.clear_session_cookies()


def test_deactivate_user(client: TestClient, event_loop: asyncio.AbstractEventLoop, test_user: dict, admin_user: dict):
    token = login(client, test_user)
    headers = {'Authorization': f'Bearer {token}'}
    response = client.delete('/users/Test', headers=headers)

    assert response.status_code == 401
    assert response.json() == {'detail': 'you are not permitted to do that'}
    client.cookies.clear_session_cookies()

    token = login(client, admin_user)
    headers = {'Authorization': f'Bearer {token}'}

    response = client.delete('/users/Test', headers=headers)
    assert response.status_code == 200
    assert response.json() == {'email': 'test@test.com', 'username': 'Test'}

    response = client.get('/users')
    assert response.status_code == 200
    assert response.json() == [{'email': 'admin@test.com', 'username': 'adminTest'}]

    async def get_user_by_db():
        user = await models_user.User.get(id=test_user['id'])
        return user

    user_obj: models_user.User = event_loop.run_until_complete(get_user_by_db())
    assert user_obj.id == test_user['id']
    assert not user_obj.is_active
    client.cookies.clear_session_cookies()


def test_deactivate_login(client: TestClient, event_loop: asyncio.AbstractEventLoop, test_user: dict):
    form = {
        'username': test_user['username'],
        'password': test_user['password']
    }

    response = client.post('/login', data=form)
    assert response.status_code == 401
    assert response.json() == {'detail': 'your account is not active'}

    async def set_user_active_again():
        user = await models_user.User.get(id=test_user['id'])
        user.is_active = True
        await user.save()
        return user

    user_obj: models_user.User = event_loop.run_until_complete(set_user_active_again())
    assert user_obj.id == test_user['id']
    assert user_obj.is_active

    assert login(client, test_user)
    client.cookies.clear_session_cookies()


def test_change_password(client: TestClient, event_loop: asyncio.AbstractEventLoop, test_user: dict):
    response = client.post('/change_password')
    assert response.status_code == 401
    assert response.json() == {'detail': 'Not authenticated'}

    token = login(client, test_user)
    cookie = client.cookies['jib']
    headers = {'Authorization': f'Bearer {token}'}
    response = client.post('/change_password', headers=headers, json={})
    assert response.status_code == 422
    assert response.json() == {
        'detail': [{'loc': ['body', 'old_password'], 'msg': 'field required', 'type': 'value_error.missing'},
                   {'loc': ['body', 'new_password'], 'msg': 'field required', 'type': 'value_error.missing'}]}

    new_password = get_random_string(32)
    response = client.post('/change_password', headers=headers,
                           json={'old_password': 'Fake Password', 'new_password': new_password})
    assert response.status_code == 401
    assert response.json() == {'detail': 'False old password'}

    time.sleep(1)
    response = client.post('/change_password', headers=headers,
                           json={'old_password': test_user['password'], 'new_password': new_password})
    assert response.status_code == 200
    data = response.json()
    assert data['token_type'] == 'bearer', data['access_token']
    assert len(response.cookies) == 1
    assert len(client.cookies) == 1
    assert token != data['access_token']
    assert cookie != client.cookies['jib']

    async def get_user_by_db():
        user = await models_user.User.get(id=test_user['id'])
        return user

    user_obj: models_user.User = event_loop.run_until_complete(get_user_by_db())
    assert user_obj.password_hash != test_user['password_hash']
    assert not user_obj.verify_password(test_user['password'])
    assert user_obj.verify_password(new_password)

    test_user['password'] = new_password
    test_user['password_hash'] = user_obj.password_hash

    assert login(client, test_user)
    client.cookies.clear_session_cookies()


def test_logout(client: TestClient, test_user: dict):
    assert login(client, test_user)

    assert len(client.cookies) == 1
    assert client.cookies['jib']

    response = client.get('/logout', allow_redirects=False)
    assert response.status_code == 307
    assert response.headers['location'] == '/'

    response = client.send(response.next)
    assert response.status_code == 200
    assert response.url == f'{client.base_url}/'

    assert len(client.cookies) == 0
    assert not client.cookies.get('jib')

    client.cookies.clear_session_cookies()


def test_index_template(client: TestClient):
    response = client.get('/')
    assert response.status_code == 200
    assert response.headers['content-type'] == 'text/html; charset=utf-8'
    assert response.template.name == 'index.html'
    assert "request" in response.context

    response = client.get('/static/js/index.js')
    assert response.status_code == 200
    assert response.headers['content-type'] == 'application/javascript'

    response = client.get('/static/css/index.css')
    assert response.status_code == 200
    assert response.headers['content-type'] == 'text/css; charset=utf-8'


def test_get_events(client: TestClient):
    response = client.get('/events')
    assert response.status_code == 200
    assert response.json() == []


def validate_event_json(json_data, event):
    return json_data == {'uuid': event['uuid'],
                         'system_id': event['system_id'],
                         'created_at': event['created_at'],
                         'updated_at': event['updated_at'],
                         'title': event['title'],
                         'start_date': event['start_date'],
                         'end_date': event['end_date'],
                         'description': event['description'],
                         'location': event['location']}


def test_create_event(client: TestClient, event_loop: asyncio.AbstractEventLoop, test_event: dict):
    data = {
        "title": test_event['title'],
        "start_date": test_event['start_date'],
        "end_date": test_event['end_date'],
        "description": test_event['description'],
        # participants: Optional[List[schemas_user.UserOut]]  # muss ContactOut sein
        "location": test_event['location']
    }
    response = client.post('/events', json=data)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data
    assert 'uuid' in json_data
    test_event['uuid'] = json_data['uuid']
    assert 'system_id' in json_data
    test_event['system_id'] = json_data['system_id']
    assert 'created_at' in json_data
    test_event['created_at'] = json_data['created_at']
    assert 'updated_at' in json_data
    test_event['updated_at'] = json_data['updated_at']
    assert validate_event_json(response.json(), test_event)

    async def get_event_by_db():
        event = await models_event.Event.get(uuid=test_event['uuid'])
        return event

    event_obj = event_loop.run_until_complete(get_event_by_db())
    assert event_obj.uuid == UUID(test_event['uuid'])


def test_fail_create_event(client: TestClient, test_event: dict):
    response = client.post('/events')
    assert response.status_code == 422
    assert response.json() == {'detail': [{'loc': ['body'],
                                           'msg': 'field required',
                                           'type': 'value_error.missing'}]}

    response = client.post('/events', json={})
    assert response.status_code == 422
    assert response.json() == {
        'detail': [{'loc': ['body', 'title'], 'msg': 'field required', 'type': 'value_error.missing'},
                   {'loc': ['body', 'start_date'], 'msg': 'field required', 'type': 'value_error.missing'},
                   {'loc': ['body', 'end_date'], 'msg': 'field required', 'type': 'value_error.missing'}]}


def test_get_events_again(client: TestClient, test_event: dict):
    response = client.get('/events')
    assert response.status_code == 200
    assert response.json() == [{'uuid': test_event['uuid'],
                                'system_id': test_event['system_id'],
                                'created_at': test_event['created_at'],
                                'updated_at': test_event['updated_at'],
                                'title': test_event['title'],
                                'start_date': test_event['start_date'],
                                'end_date': test_event['end_date'],
                                'description': test_event['description'],
                                'location': test_event['location']}]


def test_get_event(client: TestClient, test_event: dict):
    test_uuid = uuid1()
    response = client.get(f'/events/{str(test_uuid)}')
    assert response.status_code == 404
    assert response.json() == {'detail': 'Object does not exist'}

    response = client.get(f'/events/{test_event["uuid"]}')
    assert response.status_code == 200
    assert validate_event_json(response.json(), test_event)


def test_change_event(client: TestClient, event_loop: asyncio.AbstractEventLoop, test_event: dict):
    test_uuid = uuid1()
    response = client.put(f'/events/{str(test_uuid)}', json={})
    assert response.status_code == 404
    assert response.json() == {'detail': 'Object does not exist'}

    response = client.put(f'/events/{test_event["uuid"]}', json={'uuid': str(uuid1())})
    assert response.status_code == 422
    assert response.json() == {"detail": [
        {"loc": ["body", "uuid"], "msg": "extra fields not permitted", "type": "value_error.extra"}]}

    response = client.put(f'/events/{test_event["uuid"]}', json={})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data['updated_at'] != test_event['updated_at']
    test_event['updated_at'] = json_data['updated_at']
    assert validate_event_json(response.json(), test_event)

    new_title = 'Änderungs-Test'
    new_description = 'Hier testen wir ob es sich geändert hat'

    response = client.put(f'/events/{test_event["uuid"]}', json={'title': new_title, 'description': new_description})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data['title'] != test_event['title'], json_data['title'] == new_title
    test_event['title'] = new_title
    assert json_data['description'] != test_event['description'], json_data['description'] == new_description
    test_event['description'] = new_description
    assert json_data['updated_at'] != test_event['updated_at']
    test_event['updated_at'] = json_data['updated_at']

    assert validate_event_json(response.json(), test_event)

    async def get_event_by_db():
        event = await models_event.Event.get(uuid=test_event['uuid'])
        return event

    event_obj = event_loop.run_until_complete(get_event_by_db())
    assert event_obj.title == test_event['title']
    assert event_obj.description == test_event['description']


def test_delete_event(client: TestClient, event_loop: asyncio.AbstractEventLoop, test_event: dict):
    test_uuid = uuid1()
    response = client.delete(f'/events/{str(test_uuid)}')
    assert response.status_code == 404
    assert response.json() == {'detail': 'Object does not exist'}

    response = client.delete(f'/events/{test_event["uuid"]}')
    assert response.status_code == 200
    assert validate_event_json(response.json(), test_event)

    response = client.get(f'/events/{test_event["uuid"]}')
    assert response.status_code == 404
    assert response.json() == {'detail': 'Object does not exist'}

    async def is_event_in_db():
        try:
            await models_event.Event.get(uuid=test_event['uuid'])
            return True
        except:
            return False

    assert not event_loop.run_until_complete(is_event_in_db())


def test_get_events_at_last(client: TestClient):
    response = client.get('/events')
    assert response.status_code == 200
    assert response.json() == []
