from typing import Optional

from tortoise.contrib.pydantic import pydantic_model_creator
from pydantic import BaseModel
from ..models import models_todo

Todo = pydantic_model_creator(models_todo.Todo, name='Todo')

# Eigentlich unnötig, aber für den Fall, das excludes noch hinzugefügt werden erstellt:
TodoIn = pydantic_model_creator(models_todo.Todo,
                                name='TodoIn',
                                exclude_readonly=True,
                                # Bin mit mit den excludes nicht so ganz sicher?
                                exclude=('status',)
                                )

TodoOut = pydantic_model_creator(models_todo.Todo,
                                 name='TodoOut',
                                 exclude_readonly=True)




class TodoPut(BaseModel):
    title: Optional[str]
    status: Optional[bool]
    description: Optional[str]
    # Creator nicht mit angegeben?

    # vielleicht noch wichtig:
    # class Config
    # extra = Extra.forbid
