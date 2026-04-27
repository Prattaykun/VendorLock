import requests

url = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ5Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpYCiVodG1sXzc4MzhlZWYwMjdhNTQxY2M4ZDZmNzIwYjY0YjIyOWRmEgsSBxCwtvyhnxkYAZIBIQoKcHJvamVjdF9pZBITQhE4MTUzNjk0NjU3MTIwMDY0Mg&filename=&opi=89354086'
r = requests.get(url)
with open('D:/VendorLock1/frontend/public/command-center-ref.html', 'w', encoding='utf-8') as f:
    f.write(r.text)
print(f"Downloaded {len(r.text)} bytes")