# Pydantic model definitions for the API validation and response structure

from pydantic import BaseModel
from typing import List

class Client(BaseModel):
    """ Sentence for meme recommendation """
    sentence: str


class Task(BaseModel):
    """ Celery task representation """
    task_id: str
    status: str

class Recommendation(BaseModel):
    file_name: str
    emotion: str
    emotion_concord: bool

class Recommendations(BaseModel):
    """ Meme recommendation result """
    task_id: str
    status: str
    emotion: str
    recommendations: List[Recommendation]