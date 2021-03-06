from datetime import datetime, timedelta
from jose import jwt
from .models import models_user
from .schemas import schemas_user
from .config import Config


def create_access_token(user: schemas_user.User) -> str:
    jwt_obj = {'id': user.id, 'token_version': user.token_version, 'nbf': datetime.utcnow(),
               'exp': datetime.utcnow() + timedelta(minutes=15)}
    return jwt.encode(jwt_obj, Config.get_instance().get_config_value('JWT_ACCESS_TOKEN_SECRET'))


def create_refresh_token(user: schemas_user.User) -> str:
    jwt_obj = {'id': user.id, 'token_version': user.token_version, 'nbf': datetime.utcnow(),
               'exp': datetime.utcnow() + timedelta(days=7)}
    return jwt.encode(jwt_obj, Config.get_instance().get_config_value('JWT_REFRESH_TOKEN_SECRET'))


async def verify_access_token(token: str, exception: Exception) -> models_user.User:
    try:
        payload = jwt.decode(token, Config.get_instance().get_config_value('JWT_ACCESS_TOKEN_SECRET'),
                             algorithms=['HS256'])
        user = await models_user.User.get(id=payload.get('id'))
        if not payload.get('token_version') == user.token_version:
            raise exception
    except:
        raise exception

    return user


async def verify_refresh_token(token: str, exception: Exception) -> schemas_user.User:
    try:
        payload = jwt.decode(token, Config.get_instance().get_config_value('JWT_REFRESH_TOKEN_SECRET'),
                             algorithms=['HS256'])
        user = await models_user.User.get(id=payload.get('id'))
        user_obj = await schemas_user.User.from_tortoise_orm(user)
        if not user_obj:
            raise exception
        if not payload.get('token_version') == user.token_version:
            raise exception
        return user_obj
    except:
        raise exception
