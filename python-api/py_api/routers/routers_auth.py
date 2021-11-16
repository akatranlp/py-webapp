from fastapi import APIRouter, Response, Request, Depends
from fastapi.security import OAuth2PasswordRequestForm
from ..repos import repos_auth
from ..schemas import schemas_user

router = APIRouter(
    tags=['Auth'],
)


@router.post('/login', response_model=schemas_user.UserToken)
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()) -> schemas_user.UserToken:
    return await repos_auth.login(response, form_data)


@router.post("/refresh_token", response_model=schemas_user.UserToken)
async def refresh_token(request: Request, response: Response) -> schemas_user.UserToken:
    return await repos_auth.refresh_token(request, response)
