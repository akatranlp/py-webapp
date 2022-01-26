from tortoise import fields
from tortoise.models import Model
from .models_helper import DBBaseModel


class Event(DBBaseModel, Model):
    title = fields.CharField(128)
    start_date = fields.DatetimeField()
    end_date = fields.DatetimeField()
    description = fields.TextField(null=True)
    creator = fields.ForeignKeyField("models.User", related_name="events")
    location = fields.CharField(128, null=True)


class EventParticipantStatus(Model):
    id = fields.IntField(pk=True)
    status = fields.CharField(10, unique=True)


class EventParticipant(Model):
    event = fields.ForeignKeyField("models.Event", related_name="eventParticipant")
    contact = fields.ForeignKeyField("models.Contact", related_name="eventParticipant")
    status = fields.ForeignKeyField("models.EventParticipantStatus", related_name="eventParticipant")
    user = fields.ForeignKeyField("models.User", related_name="eventParticipant", null=True)
