from typing import List
from uuid import UUID
from fastapi import Depends
from ..schemas import schemas_contact
from ..models import models_user
from ..repos import repos_contact
from .. import oauth2
from .routers_helper import APIRouter

router = APIRouter(
    tags=['Contacts'],
    prefix='/contacts'
)


@router.get('/', response_model=List[schemas_contact.ContactOut])
async def get_all(user: models_user.User =
                  Depends(oauth2.get_current_active_user_model)) -> List[schemas_contact.ContactOut]:
    return await repos_contact.get_all(user)


@router.post('/', response_model=schemas_contact.ContactOut)
async def create_contact(contact: schemas_contact.ContactIn,
                         user: models_user.User =
                         Depends(oauth2.get_current_active_user_model)) -> schemas_contact.ContactOut:
    return await repos_contact.create_contact(contact, user)


@router.get('/{uuid}', response_model=schemas_contact.ContactOut)
async def get_contact(uuid: UUID,
                      user: models_user.User =
                      Depends(oauth2.get_current_active_user_model)) -> schemas_contact.ContactOut:
    return await repos_contact.get_contact(uuid, user)


@router.put('/{uuid}', response_model=schemas_contact.ContactOut)
async def change_contact(uuid: UUID, contact: schemas_contact.ContactPut,
                         user: models_user.User =
                         Depends(oauth2.get_current_active_user_model)) -> schemas_contact.ContactOut:
    return await repos_contact.change_contact(uuid, contact, user)


@router.delete('/{uuid}', response_model=schemas_contact.ContactOut)
async def delete_contact(uuid: UUID,
                         user: models_user.User =
                         Depends(oauth2.get_current_active_user_model)) -> schemas_contact.ContactOut:
    return await repos_contact.delete_contact(uuid, user)
