from fastapi import FastAPI
from py_api.routers import routers_user, routers_auth
from tortoise.contrib.fastapi import register_tortoise
from py_api.config import validate_needed_keys

needed_keys = ['JWT_REFRESH_TOKEN_SECRET', 'JWT_ACCESS_TOKEN_SECRET']
if not validate_needed_keys(needed_keys):
    raise Exception('not all Keys are there')

app = FastAPI()

app.include_router(routers_auth.router)
app.include_router(routers_user.router)


@app.get("/")
def hello():
    return {
        'success': True,
        'message': 'Hello World'
    }


register_tortoise(
    app,
    db_url='sqlite://db.sqlite3',
    modules={'models': ['py_api.models.models_user']},
    generate_schemas=True,
    add_exception_handlers=True,
)
