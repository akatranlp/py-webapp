from fastapi import Request, APIRouter
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter(
    tags=['Client'],
)

templates = Jinja2Templates(directory="templates")


@router.get('/', response_class=HTMLResponse, include_in_schema=False)
async def get_index(request: Request):
    return templates.TemplateResponse('index.html', {'request': request})


@router.get('/login', response_class=HTMLResponse, include_in_schema=False)
async def get_login(request: Request):
    return templates.TemplateResponse('login.html', {'request': request})

@router.get('/calendar', response_class=HTMLResponse, include_in_schema=False)
async def get_login(request: Request):
    return templates.TemplateResponse('calender.html', {'request': request})

@router.get('/register', response_class=HTMLResponse, include_in_schema=False)
async def get_login(request: Request):
    return templates.TemplateResponse('register.html', {'request': request})


@router.get('/my_profile', response_class=HTMLResponse, include_in_schema=False)
async def get_login(request: Request):
    return templates.TemplateResponse('my_profile.html', {'request': request})
