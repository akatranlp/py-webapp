from tortoise.contrib.pydantic import pydantic_model_creator
from pydantic import BaseModel, Extra
from typing import Optional
from ..models import models_contact

Contact = pydantic_model_creator(models_contact.Contact, name="Contact")

ContactIn = pydantic_model_creator(models_contact.Contact, name="ContactIn",
                                   exclude_readonly=True,
                                   exclude=('system_id', 'created_at', 'updated_at', 'creator'))

ContactOut = pydantic_model_creator(models_contact.Contact, name="ContactOut",)


class ContactPut(BaseModel):
    name: Optional[str]
    firstname: Optional[str]
    email: Optional[str]

    class Config:
        extra = Extra.forbid
