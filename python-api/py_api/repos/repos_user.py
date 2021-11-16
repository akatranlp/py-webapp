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


async def create(user: schemas_user.UserRegister) -> schemas_user.User:
    user_obj = models_user.User(username=user.username,
                                password_hash=hashing.hash_password(user.password_hash),
                                email=user.email)
    try:
        await user_obj.save()
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username or Email already taken')
    return await schemas_user.User.from_tortoise_orm(user_obj)
