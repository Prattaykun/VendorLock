import requests
import json

r = requests.post(
    'https://stitch.googleapis.com/mcp',
    headers={'X-Goog-Api-Key': 'AQ.Ab8RN6IJF5dQIjtrc-ASvjjjcqLqoFDlqX1Hq2omQsKNbJDW4Q'},
    json={'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list'}
)
result = json.loads(r.text)['result']
tools = result['tools']
for t in tools:
    print(t['name'])