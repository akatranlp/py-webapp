from fastapi import FastAPI
from py_api.routers import routers_user
from tortoise.contrib.fastapi import register_tortoise

app = FastAPI()

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
