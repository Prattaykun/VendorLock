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
                 'name': 'projects/81536946571200642/screens/aa66f04fe35940cfa4129570e69ddad6'
             }
        }
    }
)
data = json.loads(resp.json()['result']['content'][0]['text'])
print(json.dumps(data, indent=2))