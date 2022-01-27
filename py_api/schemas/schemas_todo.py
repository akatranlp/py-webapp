from typing import Optional

from tortoise.contrib.pydantic import pydantic_model_creator
from pydantic import BaseModel, Extra
from ..models import models_todo

Todo = pydantic_model_creator(models_todo.Todo, name='Todo')

TodoIn = pydantic_model_creator(models_todo.Todo,
                                name='TodoIn',
                                # Bin mit mit den excludes nicht so ganz sicher?
                                exclude=('uuid', 'status', 'system_id', 'created_at', 'updated_at', 'creator')
                                )

TodoOut = pydantic_model_creator(models_todo.Todo,
                                 name='TodoOut', )


class TodoPut(BaseModel):
    title: Optional[str]
    toggle: Optional[bool]
    description: Optional[str]

    class Config:
        extra = Extra.forbid
