from typing import List
from uuid import UUID

from fastapi import Depends
from ..repos import repos_todo
from .. import oauth2
from ..schemas import schemas_user
from ..schemas import schemas_todo
from ..models import models_user
from ..repos import repos_todo
from .routers_helper import APIRouter

router = APIRouter(
    tags=['Todos'],
    prefix='/todos'
)


# Alle Todos ausgeben
@router.get('/', response_model=List[schemas_todo.TodoOut])
async def get_all() -> List[schemas_todo.TodoOut]:
    return await repos_todo.get_all()


# Alle unfertigen Todos ausgeben
@router.get('/unfinished', response_model=List[schemas_todo.TodoOut])
async def get_all_unfinished() -> List[schemas_todo.TodoOut]:
    return await repos_todo.get_all_unfinished()


# Alle fertigen Todos ausgeben
@router.get('/finished', response_model=List[schemas_todo.TodoOut])
async def get_all_finished() -> List[schemas_todo.TodoOut]:
    return await repos_todo.get_all_finished()


# Eigene Todos ausgeben
@router.get("/mytodos", response_model=List[schemas_todo.TodoOut])
async def mytodos(user: schemas_user.User = Depends(oauth2.get_out_user)) -> List[schemas_todo.TodoOut]:
    return repos_todo.get_all_from_user(user)  ##Todo hier das Problem fixen?


# Vielleicht noch zu implementieren: Alle Todos eines speziellen Nutzers ausgeben

# Ein spezifischen _Todo ausgeben
@router.get('/{uuid}', response_model=schemas_todo.TodoOut)
async def get_event(uuid: UUID,
                    user: models_user.User =
                    Depends(oauth2.get_current_active_user_model)) -> schemas_todo.TodoOut:
    return await repos_todo.get_todo(uuid, user)


# Ein To-Do erstellen
@router.post('/', response_model=schemas_todo.TodoOut)
async def create_event(todo: schemas_todo.TodoIn,
                       user: models_user.User =
                       Depends(oauth2.get_current_active_user_model)) -> schemas_todo.TodoOut:
    return await repos_todo.create_todo(todo, user)


# Ein To-Do löschen
@router.delete('/{uuid}', response_model=schemas_todo.TodoOut)
async def delete_todo(uuid: UUID,
                      user: models_user.User =
                      Depends(oauth2.get_current_active_user_model)) -> schemas_todo.TodoOut:
    return await repos_todo.delete_todo(uuid, user)
