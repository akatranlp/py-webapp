from typing import List, Optional
from uuid import UUID
from fastapi import Depends
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


# Alle eigenen Todos ausgeben
@router.get("/", response_model=List[schemas_todo.TodoOut])
async def my_todos(is_finished: Optional[bool] = None,
                   user: schemas_user.User = Depends(oauth2.get_current_active_user_model)) -> List[
    schemas_todo.TodoOut]:
    return await repos_todo.get_all(user, is_finished)


# Vielleicht noch zu implementieren: Alle Todos eines speziellen Nutzers ausgeben


# Ein spezifischen _Todo ausgeben
@router.get('/{uuid}', response_model=schemas_todo.TodoOut)
async def get_todo(uuid: UUID,
                   user: models_user.User =
                   Depends(oauth2.get_current_active_user_model)) -> schemas_todo.TodoOut:
    return await repos_todo.get_todo(uuid, user)


# Ein To-Do erstellen
@router.post('/', response_model=schemas_todo.TodoOut)
async def create_todo(todo: schemas_todo.TodoIn,
                      user: models_user.User =
                      Depends(oauth2.get_current_active_user_model)) -> schemas_todo.TodoOut:
    return await repos_todo.create_todo(todo, user)


# Ein To-Do löschen
@router.delete('/{uuid}', response_model=schemas_todo.TodoOut)
async def delete_todo(uuid: UUID,
                      user: models_user.User =
                      Depends(oauth2.get_current_active_user_model)) -> schemas_todo.TodoOut:
    return await repos_todo.delete_todo(uuid, user)


# Status des ToDos ändern
@router.put('/{uuid}', response_model=schemas_todo.TodoOut)
async def change_status_todo(uuid: UUID,
                             todo: schemas_todo.TodoPut,
                             user: models_user.User =
                             Depends(oauth2.get_current_active_user_model)) -> schemas_todo.TodoOut:
    return await repos_todo.change_status_todo(uuid, todo, user)
