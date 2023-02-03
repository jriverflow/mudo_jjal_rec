# Celery app instance and associated config

import os
from celery import Celery

BROKER_URI = 'redis://localhost:6379'
BACKEND_URI = 'redis://localhost:6379'

app = Celery(
    'celery_app',
    broker=BROKER_URI,
    backend=BACKEND_URI,
    include=['celery_task_app.tasks']
)