from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from ..schemas import schemas_todo
from ..models import models_todo
from ..models import models_user


# Alle Todos ausgeben
async def get_all() -> List[schemas_todo.TodoOut]:
    todo_list = []
    async for todo_obj in models_todo.Todo.all():
        todo_list.append(await schemas_todo.TodoOut.from_tortoise_orm(todo_obj))
    return todo_list  # ggf. nur return models_todo.üTodo.all()?


# Alle fertigen Todos ausgeben
async def get_all_finished() -> List[schemas_todo.TodoOut]:
    todo_list = []
    async for todo_obj in models_todo.Todo.all():
        if todo_obj.status:
            todo_list.append(await schemas_todo.TodoOut.from_tortoise_orm(todo_obj))
    return todo_list


# Alle unfertigen Todos ausgeben
async def get_all_unfinished() -> List[schemas_todo.TodoOut]:
    todo_list = []
    async for todo_obj in models_todo.Todo.all():
        if not todo_obj.status:
            todo_list.append(await schemas_todo.TodoOut.from_tortoise_orm(todo_obj))
    return todo_list


# Alle Todos eines Nutzers ausgeben
async def get_all_from_user(user: models_user.User) -> List[schemas_todo.TodoOut]:
    todo_list = []
    async for todo_obj in models_todo.Todo.filter(creator=user):
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
    todo_obj = models_todo.Todo(
        title=todo.title,
        description=todo.description,
        creator=user)
    try:
        await todo_obj.save()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail='Beim Erstellen des ToDos ist ein Fehler aufgetreten.')
    return await schemas_todo.TodoOut.from_tortoise_orm(todo_obj)


# Ein _Todo löschen
async def delete_todo(uuid: UUID, user: models_user.User):
    todo_obj = await _get_todo(uuid, user)
    todo = await schemas_todo.TodoOut.from_tortoise_orm(todo_obj)
    await todo_obj.delete()
    return todo
