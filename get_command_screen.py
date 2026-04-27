import requests
import json

resp = requests.post(
    'https://stitch.googleapis.com/mcp',
    headers={'X-Goog-Api-Key': 'AQ.Ab8RN6IJF5dQIjtrc-ASvjjjcqLqoFDlqX1Hq2omQsKNbJDW4Q'},
    json={
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'tools/call',
        'params': {
            'name': 'get_screen',
            'arguments': {
                'name': 'projects/81536946571200642/screens/0bd60f11507746e7ad56cfa47450c188'
            }
        }
    }
)
data = json.loads(resp.json()['result']['content'][0]['text'])
print(json.dumps(data, indent=2))