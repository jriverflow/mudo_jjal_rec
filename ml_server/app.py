# FastAPI application

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from celery.result import AsyncResult

from celery_task_app.tasks import recommend_mems
from models import Client, Task, Recommendation, Recommendations
import json

app = FastAPI()

@app.post('/recommend', response_model=Task, status_code=202)
async def session(client: Client):
    """Create celery recommendation task. Return task_id to client in order to retrieve result"""
    task_id = recommend_mems.delay(dict(client))
    return Task(task_id=str(task_id), status='Processing')


@app.get('/recommend/result/{task_id}', response_model=Recommendations, status_code=200,
         responses={202: {'model': Task, 'description': 'Accepted: Not Ready'}})
async def task_result(task_id):
    """Fetch result for given task_id"""
    task = AsyncResult(task_id)
    if not task.ready():
        return JSONResponse(status_code=202, content={'task_id': str(task_id), 'status': 'Processing'})
    emotion, result = task.get()
    return Recommendations(task_id=str(task_id), status='Success', emotion=emotion, recommendations=result)