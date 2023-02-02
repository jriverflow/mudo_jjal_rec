import requests

resp = requests.post("http://localhost:5000/predict",
  files={"file": open("./static/img/cat.jpg", "rb")})