from tortoise import fields
from tortoise.models import Model
from .models_helper import DBBaseModel


class Event(DBBaseModel, Model):
    title = fields.CharField(128)
    start_date = fields.DatetimeField()
    end_date = fields.DatetimeField()
    description = fields.TextField(null=True)
    creator = fields.ForeignKeyField("models.User", related_name="events")
    participants = fields.ManyToManyField("models.Contact", related_name="events",
                                          through="event_contact")
    location = fields.CharField(128, null=True)
