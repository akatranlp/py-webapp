from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from ..schemas import schemas_event
from ..models import models_event, models_user, models_contact


async def get_all(user: models_user.User) -> List[schemas_event.EventOut]:
    event_list = []
    async for event_obj in models_event.Event.filter(creator=user):
        event_list.append(await schemas_event.EventOut.from_model(event_obj))
    return event_list


async def event_participant_in_to_model(event_participant: schemas_event.EventParticipantIn,
                                        event_obj: models_event.Event):
    try:
        contact_obj = await models_contact.Contact.get(uuid=event_participant.contact_uuid)
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Contact not found')
    try:
        user_obj = await models_user.User.get(email=contact_obj.email)
    except:
        user_obj = None
    if user_obj:
        status_obj = await models_event.EventParticipantStatus.get(status="Pending")
    else:
        status_obj = await models_event.EventParticipantStatus.get(status="Accepted")
    event_participant_obj = models_event.EventParticipant(
        event=event_obj,
        contact=contact_obj,
        user=user_obj,
        status=status_obj
    )
    try:
        await event_participant_obj.save()
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Hat nicht funktioniert')
    return event_participant_obj


async def create_event(event: schemas_event.EventIn, user: models_user.User) -> schemas_event.EventOut:
    event_obj = models_event.Event(
        title=event.title,
        start_date=event.start_date,
        end_date=event.end_date,
        description=event.description,
        creator=user,
        location=event.location)
    try:
        await event_obj.save()
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Hat nicht funktioniert')

    if event.participants:
        for p in set([p.contact_uuid for p in event.participants]):
            await event_participant_in_to_model(schemas_event.EventParticipantIn(contact_uuid=p), event_obj)
    return await schemas_event.EventOut.from_model(event_obj)


async def _get_event(uuid: UUID, user: models_user.User):
    event = await models_event.Event.get(uuid=uuid, creator=user)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Event does not exist')
    return event


async def get_event(uuid: UUID, user: models_user.User):
    return await schemas_event.EventOut.from_model(await _get_event(uuid, user))


async def change_event(uuid: UUID, event: schemas_event.EventPut, user: models_user.User):
    event_obj = await _get_event(uuid, user)
    if event.participants:
        participants = []
        async for participant in models_event.EventParticipant.filter(event=event_obj):
            participants.append(await schemas_event.EventParticipantOut.from_model(participant))
        before_participant_set = set([p.contact_uuid for p in participants])
        after_participant_set = set([p.contact_uuid for p in event.participants])
        intersection = before_participant_set & after_participant_set
        for p in before_participant_set:
            if p not in intersection:
                await (await models_event.EventParticipant.get(contact_id=p, event=event_obj)).delete()
        for p in after_participant_set:
            if p not in intersection:
                await event_participant_in_to_model(schemas_event.EventParticipantIn(contact_uuid=p), event_obj)
    if event.title:
        event_obj.title = event.title
    if event.start_date:
        event_obj.start_date = event.start_date
    if event.end_date:
        event_obj.end_date = event.end_date
    if event.description:
        event_obj.description = event.description
    if event.location:
        event_obj.location = event.location

    await event_obj.save()
    return await schemas_event.EventOut.from_model(event_obj)


async def delete_event(uuid: UUID, user: models_user.User):
    event_obj = await _get_event(uuid, user)
    event = await schemas_event.EventOut.from_model(event_obj)
    await event_obj.delete()
    return event


async def get_all_entries(uuid: UUID, user: models_user.User) -> List[schemas_event.EventParticipantOut]:
    event_obj = await _get_event(uuid, user)
    participants = []
    async for participant in models_event.EventParticipant.filter(event=event_obj):
        participants.append(await schemas_event.EventParticipantOut.from_model(participant))
    return participants


async def create_entry(uuid: UUID,
                       participant: schemas_event.EventParticipantIn,
                       user: models_user.User) -> schemas_event.EventParticipantOut:
    event_obj = await _get_event(uuid, user)
    try:
        await models_event.EventParticipant.get(contact_id=participant.contact_uuid, event=event_obj)
    except:
        return await schemas_event.EventParticipantOut.from_model(
            await event_participant_in_to_model(participant, event_obj)
        )
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Contact ist bereits in der Liste')


async def _get_entry(uuid: UUID, contact_uuid: UUID, user: models_user.User) -> models_event.EventParticipant:
    event_obj = await _get_event(uuid, user)
    participant_obj = await models_event.EventParticipant.get(contact_id=contact_uuid, event=event_obj)
    if not participant_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Entry not found')
    return participant_obj


async def get_entry(uuid: UUID, contact_uuid: UUID, user: models_user.User) -> schemas_event.EventParticipantOut:
    return await schemas_event.EventParticipantOut.from_model(await _get_entry(uuid, contact_uuid, user))


async def delete_entry(uuid: UUID, contact_uuid: UUID, user: models_user.User) -> schemas_event.EventParticipantOut:
    participant_obj = await _get_entry(uuid, contact_uuid, user)
    participant = await schemas_event.EventParticipantOut.from_model(participant_obj)
    await participant_obj.delete()
    return participant
