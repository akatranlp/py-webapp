from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from ..schemas import schemas_event
from ..models import models_event, models_user


async def get_event_invitations(status_id: Optional[int], user: models_user.User) -> List[schemas_event.EventOut]:
    event_list = []

    if status_id:
        query_set = models_event.EventParticipant.filter(user=user, status_id=status_id)
    else:
        query_set = models_event.EventParticipant.filter(user=user)

    async for participant_obj in query_set:
        event_list.append(await schemas_event.EventOut.from_model(await participant_obj.event))
    return event_list


async def _get_event_invitation(uuid: UUID, user: models_user.User) -> models_event.Event:
    event_obj = await (await models_event.EventParticipant.get(event_id=uuid, user=user)).event
    if not event_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Event Invitation not found')
    return event_obj


async def get_event_invitation(uuid: UUID, user: models_user.User) -> schemas_event.EventOut:
    return await schemas_event.EventOut.from_model(await _get_event_invitation(uuid, user))


async def change_event_invitation(uuid: UUID,
                                  invitation_status: schemas_event.InvitationsStatus,
                                  user: models_user.User) -> schemas_event.EventOut:
    status_obj = await models_event.EventParticipantStatus.get(id=invitation_status.status_id)
    if not status_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Status not found')
    event_participant_obj = await models_event.EventParticipant.get(event_id=uuid, user=user)
    event_participant_obj.status = status_obj
    await event_participant_obj.save()
    return await schemas_event.EventOut.from_model(await event_participant_obj.event)
