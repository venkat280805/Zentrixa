import requests
import json
import time

base_url = "http://localhost:8000/api"

print("1. Uploading CSV to cache dataframe...")
with open("sample_data.csv", "rb") as f:
    resp = requests.post(f"{base_url}/upload", files={"file": ("sample_data.csv", f, "text/csv")})

if resp.status_code != 200:
    print("Upload failed:", resp.text)
    exit(1)

session_id = resp.json()["session_id"]
print(f"Session established: {session_id}\n")

queries = [
    "show revenue trend over time",
    "top 5 products by profit",
    "compare regions by revenue",
    "average profit per category"
]

print("2. Testing required queries...")
for q in queries:
    print(f"\nUser: {q}")
    payload = {"query": q, "session_id": session_id}
    chat_resp = requests.post(f"{base_url}/chat", json=payload)
    data = chat_resp.json()
    
    print(f"AI: {data['response']}")
    if data.get('chart_data'):
        chart = data['chart_data']
        print(f"    [CHART RENDERED: {chart['type'].upper()} CHART] Title: {chart['title']}")
        print(f"    Labels: {chart['labels'][:3]}... Values: {chart['values'][:3]}...")
    else:
        print("    [NO CHART RETURNED]")
