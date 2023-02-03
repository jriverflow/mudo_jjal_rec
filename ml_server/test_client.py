# Test the set-up

import requests
from time import sleep

test_body = {
    "sentence": "술만 마셨어"
}


def dummy_task(data, poll_interval=5, max_attempts=5):
    base_uri = r'http://127.0.0.1:8000'
    recommend_task_uri = base_uri + '/recommend'
    task = requests.post(recommend_task_uri, json=data)
    task_id = task.json()['task_id']
    recommend_result_uri = base_uri + '/recommend/result/' + task_id
    attempts = 0
    result = None
    while attempts < max_attempts:
        attempts += 1
        result_response = requests.get(recommend_result_uri)
        if result_response.status_code == 200:
            result = result_response.json()['recommendations']
            break
        sleep(poll_interval)
    return result


if __name__ == '__main__':
    recommendations = dummy_task(test_body)
    print(recommendations)