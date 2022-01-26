from typing import List, Optional
from uuid import UUID
from fastapi import Depends
from ..schemas import schemas_event
from ..models import models_user
from ..repos import repos_invitation
from .. import oauth2
from .routers_helper import APIRouter

router = APIRouter(
    tags=['Events'],
    prefix='/invitations'
)


@router.get('/', response_model=List[schemas_event.EventOut])
async def get_all_event_invitations(status_id: Optional[int] = None,
                                    user: models_user.User =
                                    Depends(oauth2.get_current_active_user_model)) -> List[schemas_event.EventOut]:
    return await repos_invitation.get_event_invitations(status_id, user)


@router.get('/{uuid}', response_model=schemas_event.EventOut)
async def get_event_invitation(uuid: UUID,
                               user: models_user.User =
                               Depends(oauth2.get_current_active_user_model)) -> schemas_event.EventOut:
    return await repos_invitation.get_event_invitation(uuid, user)


@router.put('/{uuid}', response_model=schemas_event.EventOut)
async def change_event_invitations(uuid: UUID,
                                   invitation_status: schemas_event.InvitationsStatus,
                                   user: models_user.User =
                                   Depends(oauth2.get_current_active_user_model)) -> schemas_event.EventOut:
    return await repos_invitation.change_event_invitation(uuid, invitation_status, user)
