from fastapi import FastAPI
from py_api.routers import routers_user

app = FastAPI()

app.include_router(routers_user.router)


@app.get("/")
def hello():
    return {
        'success': True,
        'message': 'Hello World'
    }
