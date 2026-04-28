import requests

url = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ5Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpYCiVodG1sXzk2MWRjMzY3Yjg4NjRjODA4Y2RhOTY5YzFlZmMyY2I0EgsSBxCwtvyhnxkYAZIBIQoKcHJvamVjdF9pZBITQhE4MTUzNjk0NjU3MTIwMDY0Mg&filename=&opi=89354086'
r = requests.get(url)
with open('D:/VendorLock1/beat_intelligence.html', 'w', encoding='utf-8') as f:
    f.write(r.text)
print(f"Downloaded {len(r.text)} bytes")