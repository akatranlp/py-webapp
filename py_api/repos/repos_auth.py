from fastapi import Response, Request, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from .. import jwt_token
from ..models import models_user
from ..schemas import schemas_user


async def authenticate_user(username: str, password: str):
    user = await models_user.User.get(username=username)
    if not user:
        return False
    if not user.verify_password(password):
        return False
    return user


def add_refresh_cookie(response: Response, user_obj: schemas_user.User):
    response.set_cookie(key='jib',
                        value=jwt_token.create_refresh_token(user_obj),
                        httponly=True,
                        path='/refresh_token')


async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()) -> schemas_user.UserToken:
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='invalid credentials')
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='your account is not active')
    user_obj = await schemas_user.User.from_tortoise_orm(user)
    add_refresh_cookie(response, user_obj)
    return schemas_user.UserToken(access_token=jwt_token.create_access_token(user_obj), token_type='bearer')


def logout(response: Response):
    response.delete_cookie(key='jib', path='/refresh_token')


async def logout_all(user: models_user.User, response: Response):
    user.token_version += 1
    await user.save()
    response.delete_cookie(key='jib', path='/refresh_token')


async def refresh_token(request: Request, response: Response) -> schemas_user.UserToken:
    exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Refresh Token invalid')
    try:
        cookie: str = request.cookies.get('jib')
        user = await jwt_token.verify_refresh_token(cookie, exception)

        add_refresh_cookie(response, user)
        return schemas_user.UserToken(access_token=jwt_token.create_access_token(user), token_type='bearer')
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Refresh Token invalid')


async def change_password(response: Response, passwords: schemas_user.UserChangePassword,
                          user: schemas_user.User) -> schemas_user.UserToken:
    user_obj = await models_user.User.get(username=user.username)
    if not await user_obj.set_new_password(passwords.old_password, passwords.new_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='False old password')
    add_refresh_cookie(response, user)
    return schemas_user.UserToken(access_token=jwt_token.create_access_token(user), token_type='bearer')
