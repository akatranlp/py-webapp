from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from ..schemas import schemas_todo
from ..models import models_todo
from ..models import models_user


# Alle Todos eines Nutzers ausgeben
async def get_all(user: models_user.User, is_finished: Optional[bool]) -> List[schemas_todo.TodoOut]:
    todo_list = []
    async for todo_obj in models_todo.Todo.filter(creator=user) if is_finished is None else models_todo.Todo.filter(
            status=is_finished, creator=user):
        todo_list.append(await schemas_todo.TodoOut.from_tortoise_orm(todo_obj))
    return todo_list


# interner get_todo, hilfsfunktion fürs normale get_todo
async def _get_todo(uuid: UUID,
                    user: models_user.User):  # ggf überprüfung mit user nicht nötig? aber sonst gibts keine Verifikation der Person...
    todo = await models_todo.Todo.get(uuid=uuid, creator=user)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Todo does not exist')
    return todo


# Spezifischen _Todo ausgeben
async def get_todo(uuid: UUID, user: models_user.User):
    return await schemas_todo.TodoOut.from_tortoise_orm(await _get_todo(uuid, user))


# Ein _Todo erstellen
async def create_todo(todo: schemas_todo.TodoIn, user: models_user.User) -> schemas_todo.TodoOut:
    if todo.title == "":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail='missing_title')
    todo_obj = models_todo.Todo(
        title=todo.title,
        description=todo.description,
        creator=user)
    try:
        await todo_obj.save()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail='unparsable_input')
    return await schemas_todo.TodoOut.from_tortoise_orm(todo_obj)


# Ein _Todo löschen
async def delete_todo(uuid: UUID, user: models_user.User):
    todo_obj = await _get_todo(uuid, user)
    todo = await schemas_todo.TodoOut.from_tortoise_orm(todo_obj)
    await todo_obj.delete()
    return todo


# Ein _Todo-Status ändern
async def change_status_todo(uuid: UUID, todo: schemas_todo.TodoPut, user: models_user.User):
    todo_obj = await _get_todo(uuid, user)
    if todo.toggle:  # Bei True wird er getoggled, bei false wird er nicht getoggled
        todo_obj.status = False if todo_obj.status else True  # Invertiert den Status
    if todo.title:
        todo_obj.title = todo.title
    elif todo.title == "":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail='missing_title')
    if todo.description or todo.description=="":
        todo_obj.description = todo.description

    await todo_obj.save()
    return await schemas_todo.TodoOut.from_tortoise_orm(todo_obj)
