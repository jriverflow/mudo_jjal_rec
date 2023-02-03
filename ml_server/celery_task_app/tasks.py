# Celery task definition

import importlib
import logging
import json
from celery import Task

from .worker import app

class RecommendTask(Task):
    """
    Abstraction of Celery's Task class to support loading ML model.
    """
    abstract = True

    def __init__(self):
        super().__init__()
        self.model = None

    def __call__(self, *args, **kwargs):
        """
        Load model on first call (i.e. first task processed)
        Avoids the need to load model on each task request
        """
        if not self.model:
            logging.info('Loading Model...')
            module_import = importlib.import_module(self.path[0])
            model_obj = getattr(module_import, self.path[1])
            self.model = model_obj()
            logging.info('Model loaded')
        return self.run(*args, **kwargs)


@app.task(ignore_result=False,
          bind=True,
          base=RecommendTask,
          path=('celery_task_app.ml.model', 'RecModel'),
          name='{}.{}'.format(__name__, 'Meme'))
def recommend_mems(self, data):
    """
    Essentially the run method of RecommendTask
    """
    recommendations = self.model.recommend(data['sentence'])
    return recommendations