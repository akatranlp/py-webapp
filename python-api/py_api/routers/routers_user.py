from typing import List
from fastapi import APIRouter, Depends
from ..schemas import schemas_user
from ..repos import repos_user
from .. import oauth2

router = APIRouter(
    tags=['Users'],
    prefix='/users'
)


@router.get('/', response_model=List[schemas_user.UserOut])
async def get_all() -> List[schemas_user.UserOut]:
    return await repos_user.get_all()


@router.get("/me", response_model=schemas_user.UserOut)
async def me(user: schemas_user.User = Depends(oauth2.get_out_user)) -> schemas_user.UserOut:
    return user


@router.post('/', response_model=schemas_user.User)
async def create_user(user: schemas_user.UserRegister) -> schemas_user.User:
    return await repos_user.create(user)
