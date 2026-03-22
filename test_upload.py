import sys
import os
import json

try:
    import pandas
    import numpy
except ImportError:
    os.system("python -m pip install pandas python-multipart fastapi httpx numpy")

sys.path.append(os.path.abspath("backend"))
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

print("Testing upload endpoint with sample_data.csv...")
with open("sample_data.csv", "rb") as f:
    response = client.post("/api/upload", files={"file": ("sample_data.csv", f, "text/csv")})

print(f"Status Code: {response.status_code}")
out_data = response.json()

if response.status_code == 200:
    print("\n--- INSIGHTS ---")
    for i in out_data.get('insights', []):
        print(f"{i['icon']} {i['text']} | Value: {i['value']}")
else:
    print(f"Error: {out_data}")
