from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from ..schemas import schemas_contact
from ..models import models_contact, models_user


async def get_all(user: models_user.User) -> List[schemas_contact.ContactOut]:
    contact_list = []
    async for contact_obj in models_contact.Contact.filter(creator=user):
        contact_list.append(await schemas_contact.ContactOut.from_tortoise_orm(contact_obj))
    return contact_list


async def create_contact(contact: schemas_contact.ContactIn, user: models_user.User) -> schemas_contact.ContactOut:
    contact_obj = models_contact.Contact(
        name=contact.name,
        firstname=contact.firstname,
        email=contact.email,
        creator=user)
    try:
        await contact_obj.save()
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Hat nicht funktioniert')
    return await schemas_contact.ContactOut.from_tortoise_orm(contact_obj)


async def _get_contact(uuid: UUID, user: models_user.User):
    contact = await models_contact.Contact.get(uuid=uuid, creator=user)
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Contact does not exist')
    return contact


async def get_contact(uuid: UUID, user: models_user.User):
    return await schemas_contact.ContactOut.from_tortoise_orm(await _get_contact(uuid, user))


async def change_contact(uuid: UUID, contact: schemas_contact.ContactPut, user: models_user.User):
    contact_obj = await _get_contact(uuid, user)
    if contact.name:
        contact_obj.name = contact.name
    if contact.firstname:
        contact_obj.firstname = contact.firstname
    if contact.email:
        contact_obj.email = contact.email

    await contact_obj.save()
    return await schemas_contact.ContactOut.from_tortoise_orm(contact_obj)


async def delete_contact(uuid: UUID, user: models_user.User):
    contact_obj = await _get_contact(uuid, user)
    contact = await schemas_contact.ContactOut.from_tortoise_orm(contact_obj)
    await contact_obj.delete()
    return contact
