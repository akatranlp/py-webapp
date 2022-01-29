from typing import List
from fastapi import HTTPException, status
from ..schemas import schemas_user
from ..models import models_user
from .. import hashing


async def get_all() -> List[schemas_user.UserOut]:
    user_list = []
    async for user_obj in models_user.User.all():
        user_list.append(await schemas_user.UserOut.from_tortoise_orm(user_obj))
    return user_list


async def _get_user(user_name: str) -> models_user.User:
    user = await models_user.User.get(username=user_name)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User does not exist')
    return user


async def get_user(user_name: str) -> schemas_user.UserOut:
    return await schemas_user.UserOut.from_tortoise_orm(await _get_user(user_name))


async def change_user(user_name: str, user_obj: schemas_user.UserPut) -> schemas_user.UserOut:
    user = await _get_user(user_name)
    if user_obj.is_active is not None:
        user.is_active = user_obj.is_active
        user.token_version += 1
    if user_obj.is_admin is not None:
        user.is_admin = user_obj.is_admin
        user.token_version += 1
    await user.save()
    return await schemas_user.UserOut.from_tortoise_orm(user)


async def delete_user(user_name: str) -> schemas_user.UserOut:
    user = await _get_user(user_name)
    user_obj = await schemas_user.UserOut.from_tortoise_orm(user)
    await user.delete()
    return user_obj


async def create(user: schemas_user.UserRegister) -> schemas_user.UserOut:
    user_obj = models_user.User(username=user.username,
                                password_hash=hashing.hash_password(user.password_hash),
                                email=user.email)
    try:
        await user_obj.save()
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username or Email already taken')
    return await schemas_user.UserOut.from_tortoise_orm(user_obj)
