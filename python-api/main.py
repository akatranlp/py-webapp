from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from py_api.routers import routers_user, routers_auth, routers_client
from tortoise.contrib.fastapi import register_tortoise
from py_api.config import Config

Config.get_instance().register_needed_keys(keys=['JWT_REFRESH_TOKEN_SECRET', 'JWT_ACCESS_TOKEN_SECRET'])
Config.get_instance().validate_needed_keys()

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
    db_url=Config.get_instance().get_config_value('DATABASE_URL', 'sqlite://db.sqlite3'),
    modules={'models': ['py_api.models.models_user']},
    generate_schemas=True,
    add_exception_handlers=True,
)
