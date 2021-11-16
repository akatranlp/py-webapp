from datetime import datetime, timedelta
from jose import jwt
from .models import models_user
from .schemas import schemas_user

JWT_REFRESH_TOKEN_SECRET = 'testing Secret'
JWT_ACCESS_TOKEN_SECRET = 'testing Secret2'


def create_access_token(user: schemas_user.User) -> str:
    jwt_obj = {'id': user.id, 'nbf': datetime.utcnow(), 'exp': datetime.utcnow() + timedelta(minutes=15)}
    return jwt.encode(jwt_obj, JWT_ACCESS_TOKEN_SECRET)


def create_refresh_token(user: schemas_user.User) -> str:
    jwt_obj = {'id': user.id, 'token_version': user.token_version, 'nbf': datetime.utcnow(),
               'exp': datetime.utcnow() + timedelta(days=7)}
    return jwt.encode(jwt_obj, JWT_REFRESH_TOKEN_SECRET)


async def verify_access_token(token: str, exception: Exception) -> schemas_user.User:
    try:
        payload = jwt.decode(token, JWT_ACCESS_TOKEN_SECRET, algorithms=['HS256'])
        user = await models_user.User.get(id=payload.get('id'))
    except:
        raise exception

    return await schemas_user.User.from_tortoise_orm(user)


async def verify_refresh_token(token: str, exception: Exception) -> schemas_user.User:
    try:
        payload = jwt.decode(token, JWT_REFRESH_TOKEN_SECRET, algorithms=['HS256'])
        user = await models_user.User.get(id=payload.get('id'))
        user_obj = await schemas_user.User.from_tortoise_orm(user)
        if not user_obj:
            raise exception
        if not payload.get('token_version') == user.token_version:
            raise exception
        return user_obj
    except:
        raise exception
