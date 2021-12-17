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


# TODO: add User Authentication and Participant support
@router.get('/', response_model=List[schemas_event.EventOut])
async def get_all(user: models_user.User =
                  Depends(oauth2.get_current_active_user_model)) -> List[schemas_event.EventOut]:
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
