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
                'name': 'projects/81536946571200642/screens/4fa2769f4b4846039ddda6713cda32a8'
            }
        }
    }
)
data = json.loads(resp.json()['result']['content'][0]['text'])
print('HTML file name:', data['htmlCode']['name'])
print('HTML download URL:', data['htmlCode']['downloadUrl'])
