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


class Recommendations(BaseModel):
    """ Meme recommendation result """
    task_id: str
    status: str
    recommendations: List[str]