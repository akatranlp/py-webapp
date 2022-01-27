from typing import List
from fastapi import Depends
from ..schemas import schemas_user
from ..repos import repos_user
from .. import oauth2
from .routers_helper import APIRouter

router = APIRouter(
    tags=['Users'],
    prefix='/users'
)


@router.get('/', response_model=List[schemas_user.UserOut])
async def get_all(user: schemas_user.User = Depends(oauth2.get_current_active_user)) -> List[schemas_user.UserOut]:
    oauth2.check_permission(user)
    return await repos_user.get_all()


@router.get("/me", response_model=schemas_user.UserOut)
async def me(user: schemas_user.User = Depends(oauth2.get_out_user)) -> schemas_user.UserOut:
    return user


@router.post('/', response_model=schemas_user.UserOut)
async def create_user(user: schemas_user.UserRegister) -> schemas_user.UserOut:
    return await repos_user.create(user)


@router.get("/{user_name}", response_model=schemas_user.UserOut)
async def get_user(user_name: str,
                   user: schemas_user.User = Depends(oauth2.get_current_active_user)) -> schemas_user.UserOut:
    oauth2.check_permission(user)
    return await repos_user.get_user(user_name)


@router.put("/{user_name}", response_model=schemas_user.UserOut)
async def change_user(user_name: str,
                      user_obj: schemas_user.UserPut,
                      user: schemas_user.User = Depends(oauth2.get_current_active_user)) -> schemas_user.UserOut:
    oauth2.check_permission(user)
    return await repos_user.change_user(user_name, user_obj)


@router.delete("/{user_name}", response_model=schemas_user.UserOut)
async def get_user(user_name: str,
                   user: schemas_user.User = Depends(oauth2.get_current_active_user)) -> schemas_user.UserOut:
    if not user_name == user.username:
        oauth2.check_permission(user)
    return await repos_user.delete_user(user_name)
