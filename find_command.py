import requests
import json

r = requests.post(
    'https://stitch.googleapis.com/mcp',
    headers={'X-Goog-Api-Key': 'AQ.Ab8RN6IJF5dQIjtrc-ASvjjjcqLqoFDlqX1Hq2omQsKNbJDW4Q'},
    json={'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call', 'params': {'name': 'list_screens', 'arguments': {'projectId': '81536946571200642'}}}
)
data = json.loads(r.json()['result']['content'][0]['text'])
for s in data['screens']:
    if 'Command Center' in s.get('title', ''):
        print(f"{s['title']} | {s['name'].split('/')[-1]}")