from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from . import jwt_token
from .schemas import schemas_user
from .models import models_user

oauth2_schema = OAuth2PasswordBearer(tokenUrl='login')


def check_permission(user: schemas_user.User):
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='you are not permitted to do that')


async def get_current_user(token_data: str = Depends(oauth2_schema)) -> schemas_user.User:
    exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='invalid credentials')
    return await jwt_token.verify_access_token(token_data, exception)


async def get_current_active_user(user: schemas_user.User = Depends(get_current_user)) -> schemas_user.User:
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='you are blocked')
    return user


async def get_out_user(user: schemas_user.User = Depends(get_current_active_user)) -> schemas_user.UserOut:
    user_obj = await models_user.User.get(id=user.id)
    return await schemas_user.UserOut.from_tortoise_orm(user_obj)
