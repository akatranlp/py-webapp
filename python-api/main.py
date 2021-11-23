from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from py_api.routers import routers_user, routers_auth, routers_client
from tortoise.contrib.fastapi import register_tortoise
from py_api.config import validate_needed_keys, get_config_value

needed_keys = ['JWT_REFRESH_TOKEN_SECRET', 'JWT_ACCESS_TOKEN_SECRET']
if not validate_needed_keys(needed_keys):
    raise Exception('not all Keys are there')

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(routers_auth.router)
app.include_router(routers_user.router)
app.include_router(routers_client.router)


@app.get("/hello-world")
def hello():
    return {
        'success': True,
        'message': 'Hello World'
    }


register_tortoise(
    app,
    db_url=get_config_value('DATABASE_URL', 'sqlite://db.sqlite3'),
    modules={'models': ['py_api.models.models_user']},
    generate_schemas=True,
    add_exception_handlers=True,
)
