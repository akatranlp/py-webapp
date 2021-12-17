from tortoise import fields
from tortoise.models import Model
from .models_helper import DBBaseModel


class Todo(DBBaseModel, Model):
    title = fields.CharField(128)
    status = fields.BooleanField(default=False)
    description = fields.TextField(null=True)
    creator = fields.ForeignKeyField("models.User", related_name="todo")
