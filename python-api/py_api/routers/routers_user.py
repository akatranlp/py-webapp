from typing import List
from fastapi import APIRouter
from ..schemas import schemas_user
from ..repos import repos_user

router = APIRouter(
    tags=['Users'],
    prefix='/users'
)


@router.get('/', response_model=List[schemas_user.UserOut])
async def get_all() -> List[schemas_user.UserOut]:
    return await repos_user.get_all()
