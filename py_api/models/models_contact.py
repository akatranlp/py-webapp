from tortoise import fields
from tortoise.models import Model
from .models_helper import DBBaseModel


class Contact(DBBaseModel, Model):
    name = fields.CharField(128)
    firstname = fields.CharField(128)
    email = fields.CharField(50, unique=True)
    creator = fields.ForeignKeyField("models.User", related_name="contact")
