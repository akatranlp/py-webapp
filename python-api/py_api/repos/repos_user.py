from typing import List
from ..schemas import schemas_user
from ..models import models_user


async def get_all() -> List[schemas_user.UserOut]:
    user_list = []
    async for user_obj in models_user.User.all():
        user_list.append(await schemas_user.UserOut.from_tortoise_orm(user_obj))
    return user_list
