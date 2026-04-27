import requests
import json

resp = requests.post(
    'https://stitch.googleapis.com/mcp',
    headers={'X-Goog-Api-Key': 'AQ.Ab8RN6IJF5dQIjtrc-ASvjjjcqLqoFDlqX1Hq2omQsKNbJDW4Q'},
    json={'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call', 'params': {'name': 'list_screens', 'arguments': {'projectId': '81536946571200642'}}}
)
data = json.loads(resp.json()['result']['content'][0]['text'])
for s in data['screens']:
    if 'Beat Intelligence' in s.get('title', '') and 'India Control Tower' in s.get('title', ''):
        print(f"Title: {s['title']}")
        print(f"Name: {s['name']}")
        print(f"Width x Height: {s.get('width', '?')}x{s.get('height', '?')}")
        print("---")