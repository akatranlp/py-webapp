import datetime
from uuid import UUID
from tortoise.contrib.pydantic import pydantic_model_creator
from pydantic import BaseModel, Extra
from typing import Optional, List
from ..models import models_event

EventParticipant = pydantic_model_creator(models_event.EventParticipant, name="EventParticipant")


class EventParticipantIn(BaseModel):
    contact_uuid: UUID

    class Config:
        extra = Extra.forbid


class EventParticipantOut(BaseModel):
    contact_uuid: UUID
    contact_firstname: str
    contact_name: str
    contact_email: str
    user_id: Optional[int]
    status: str

    class Config:
        extra = Extra.forbid

    @classmethod
    async def from_model(cls, model: models_event.EventParticipant):
        user = (await model.user) if model.user else None
        contact = await model.contact
        return EventParticipantOut(
            contact_uuid=contact.uuid,
            contact_firstname=contact.firstname,
            contact_name=contact.name,
            contact_email=contact.email,
            user_id=user.id if user else None,
            status=(await model.status).status
        )


Event = pydantic_model_creator(models_event.Event, name="Event")


class EventIn(BaseModel):
    title: str
    start_date: datetime.datetime
    end_date: datetime.datetime
    description: Optional[str]
    participants: Optional[List[EventParticipantIn]]
    location: Optional[str]

    class Config:
        extra = Extra.forbid


class EventOut(BaseModel):
    uuid: UUID
    system_id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    title: str
    start_date: datetime.datetime
    end_date: datetime.datetime
    description: Optional[str]
    participants: Optional[List[EventParticipantOut]]
    location: Optional[str]
    creator_username: str
    creator_email: str

    class Config:
        extra = Extra.forbid

    @classmethod
    async def from_model(cls, model: models_event.Event):
        participants = []
        async for participant in models_event.EventParticipant.filter(event=model):
            participants.append(await EventParticipantOut.from_model(participant))
        creator = await model.creator
        return EventOut(
            uuid=model.uuid,
            system_id=model.system_id,
            created_at=model.created_at,
            updated_at=model.updated_at,
            title=model.title,
            start_date=model.start_date,
            end_date=model.end_date,
            description=model.description,
            participants=participants,
            location=model.location,
            creator_username=creator.username,
            creator_email=creator.email
        )


class EventPut(BaseModel):
    title: Optional[str]
    start_date: Optional[datetime.datetime]
    end_date: Optional[datetime.datetime]
    description: Optional[str]
    participants: Optional[List[EventParticipantIn]]
    location: Optional[str]

    class Config:
        extra = Extra.forbid
