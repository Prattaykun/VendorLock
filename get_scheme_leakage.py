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
                'name': 'projects/81536946571200642/screens/afa26ab4c4b14912b832393f6485b627'
            }
        }
    }
)
data = json.loads(resp.json()['result']['content'][0]['text'])
print('Title:', data['title'])
print('Screenshot URL:', data['screenshot']['downloadUrl'])
print('HTML URL:', data['htmlCode']['downloadUrl'])
print('Width:', data['width'])
print('Height:', data['height'])
