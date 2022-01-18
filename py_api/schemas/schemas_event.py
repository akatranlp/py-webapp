import datetime
from tortoise.contrib.pydantic import pydantic_model_creator
from pydantic import BaseModel, Extra
from typing import Optional, List
from ..models import models_event
from ..schemas import schemas_user

Event = pydantic_model_creator(models_event.Event, name="Event")

EventIn = pydantic_model_creator(models_event.Event, name="EventIn",
                                 exclude_readonly=True,
                                 exclude=('participants', 'system_id', 'created_at', 'updated_at', 'creator'))

EventOut = pydantic_model_creator(models_event.Event, name="EventOut",
                                  exclude=('participants',))


class EventPut(BaseModel):
    title: Optional[str]
    start_date: Optional[datetime.datetime]
    end_date: Optional[datetime.datetime]
    description: Optional[str]
    participants: Optional[List[schemas_user.UserOut]]  # muss ContactOut sein
    location: Optional[str]

    class Config:
        extra = Extra.forbid
