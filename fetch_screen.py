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
            'name': 'fetch_screen_code',
            'arguments': {
                'name': 'projects/81536946571200642/screens/d6aabf94bc6b41b38c492a3b41506811'
            }
        }
    }
)
result = resp.json()['result']['content']
for item in result:
    if 'downloadUrl' in item:
        print(item['downloadUrl'])
        break