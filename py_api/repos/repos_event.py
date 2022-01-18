from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from ..schemas import schemas_event
from ..models import models_event, models_user


async def get_all(user: models_user.User) -> List[schemas_event.EventOut]:
    event_list = []
    async for event_obj in models_event.Event.filter(creator=user):
        event_list.append(await schemas_event.EventOut.from_tortoise_orm(event_obj))
    return event_list


# TODO participants fehlen noch
async def create_event(event: schemas_event.EventIn, user: models_user.User) -> schemas_event.EventOut:
    event_obj = models_event.Event(
        title=event.title,
        start_date=event.start_date,
        end_date=event.end_date,
        description=event.description,
        creator=user,
        # participants = None,
        location=event.location)
    try:
        await event_obj.save()
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Hat nicht funktioniert')
    return await schemas_event.EventOut.from_tortoise_orm(event_obj)


async def _get_event(uuid: UUID, user: models_user.User):
    event = await models_event.Event.get(uuid=uuid, creator=user)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Event does not exist')
    return event


async def get_event(uuid: UUID, user: models_user.User):
    return await schemas_event.EventOut.from_tortoise_orm(await _get_event(uuid, user))


# TODO participants fehlen noch
async def change_event(uuid: UUID, event: schemas_event.EventPut, user: models_user.User):
    event_obj = await _get_event(uuid, user)
    if event.title:
        event_obj.title = event.title
    if event.start_date:
        event_obj.start_date = event.start_date
    if event.end_date:
        event_obj.end_date = event.end_date
    if event.description:
        event_obj.description = event.description
    # participants: Optional[List[schemas_user.UserOut]]  # muss ContactOut sein
    if event.location:
        event_obj.location = event.location

    await event_obj.save()
    return await schemas_event.EventOut.from_tortoise_orm(event_obj)


async def delete_event(uuid: UUID, user: models_user.User):
    event_obj = await _get_event(uuid, user)
    event = await schemas_event.EventOut.from_tortoise_orm(event_obj)
    await event_obj.delete()
    return event