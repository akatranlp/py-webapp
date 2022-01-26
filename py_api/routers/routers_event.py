from typing import List
from uuid import UUID

from fastapi import Depends
from ..schemas import schemas_event
from ..models import models_user
from ..repos import repos_event
from .. import oauth2
from .routers_helper import APIRouter

router = APIRouter(
    tags=['Events'],
    prefix='/events'
)


@router.get('/', response_model=List[schemas_event.Event])
async def get_all(user: models_user.User =
                  Depends(oauth2.get_current_active_user_model)) -> List[schemas_event.Event]:
    return await repos_event.get_all(user)


@router.post('/', response_model=schemas_event.EventOut)
async def create_event(event: schemas_event.EventIn,
                       user: models_user.User =
                       Depends(oauth2.get_current_active_user_model)) -> schemas_event.EventOut:
    return await repos_event.create_event(event, user)


@router.get('/{uuid}', response_model=schemas_event.EventOut)
async def get_event(uuid: UUID,
                    user: models_user.User =
                    Depends(oauth2.get_current_active_user_model)) -> schemas_event.EventOut:
    return await repos_event.get_event(uuid, user)


@router.put('/{uuid}', response_model=schemas_event.EventOut)
async def change_event(uuid: UUID, event: schemas_event.EventPut,
                       user: models_user.User =
                       Depends(oauth2.get_current_active_user_model)) -> schemas_event.EventOut:
    return await repos_event.change_event(uuid, event, user)


@router.delete('/{uuid}', response_model=schemas_event.EventOut)
async def delete_event(uuid: UUID,
                       user: models_user.User =
                       Depends(oauth2.get_current_active_user_model)) -> schemas_event.EventOut:
    return await repos_event.delete_event(uuid, user)


@router.get('/{uuid}/entries', response_model=List[schemas_event.EventParticipantOut])
async def get_all_entries(uuid: UUID,
                          user: models_user.User =
                          Depends(oauth2.get_current_active_user_model)) -> List[schemas_event.EventParticipantOut]:
    return await repos_event.get_all_entries(uuid, user)


@router.post('/{uuid}/entries', response_model=schemas_event.EventParticipantOut)
async def create_entry(uuid: UUID,
                       participant: schemas_event.EventParticipantIn,
                       user: models_user.User =
                       Depends(oauth2.get_current_active_user_model)) -> schemas_event.EventParticipantOut:
    return await repos_event.create_entry(uuid, participant, user)


@router.get('/{uuid}/entries/{contact_uuid}', response_model=schemas_event.EventParticipantOut)
async def get_entry(uuid: UUID,
                    contact_uuid: UUID,
                    user: models_user.User =
                    Depends(oauth2.get_current_active_user_model)) -> schemas_event.EventParticipantOut:
    return await repos_event.get_entry(uuid, contact_uuid, user)


@router.delete('/{uuid}/entries/{contact_uuid}', response_model=schemas_event.EventParticipantOut)
async def delete_entry(uuid: UUID,
                       contact_uuid: UUID,
                       user: models_user.User =
                       Depends(oauth2.get_current_active_user_model)) -> schemas_event.EventParticipantOut:
    return await repos_event.delete_entry(uuid, contact_uuid, user)
