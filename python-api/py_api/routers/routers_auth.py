from fastapi import APIRouter, Response, Request, Depends
from fastapi.security import OAuth2PasswordRequestForm
from ..repos import repos_auth

router = APIRouter(
    tags=['Auth'],
)


@router.post('/login')
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    return await repos_auth.login(response, form_data)


@router.post("/refresh_token")
async def refresh_token(request: Request, response: Response):
    return await repos_auth.refresh_token(request, response)
