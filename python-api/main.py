from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def hello():
    return {
        'success': True,
        'message': 'Hello World'
    }
