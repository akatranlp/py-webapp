from typing import List
from uuid import UUID

from fastapi import Depends
from ..schemas import schemas_event
from ..repos import repos_event
from .. import oauth2
from .routers_helper import APIRouter

router = APIRouter(
    tags=['Events'],
    prefix='/events'
)


# TODO: add User Authentication and Participant support
@router.get('/', response_model=List[schemas_event.EventOut])
async def get_all() -> List[schemas_event.EventOut]:
    return await repos_event.get_all()


@router.post('/', response_model=schemas_event.EventOut)
async def create_event(event: schemas_event.EventIn) -> schemas_event.EventOut:  # der user muss noch eingefügt werden
    return await repos_event.create_event(event)


@router.get('/{uuid}', response_model=schemas_event.EventOut)
async def get_event(uuid: UUID) -> schemas_event.EventOut:
    return await repos_event.get_event(uuid)


@router.put('/{uuid}', response_model=schemas_event.EventOut)
async def change_event(uuid: UUID, event: schemas_event.EventPut) -> schemas_event.EventOut:
    return await repos_event.change_event(uuid, event)


@router.delete('/{uuid}', response_model=schemas_event.EventOut)
async def delete_event(uuid: UUID) -> schemas_event.EventOut:
    return await repos_event.delete_event(uuid)
