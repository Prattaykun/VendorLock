import requests

screenshot_url = 'https://lh3.googleusercontent.com/aida/ADBb0uhiSeOK_Ot9ej-cQf2MwgxjjbYCsoRirHLNUu2p-px2qORi-M6rMOEWG3LRt15LKHvE0vOkQ2TaimhHlRcpPeCtQe0UxKVotCgHmX64q3JtZw42O_sJdqABnkMxckwcek7yYG9zFtWtqUzezLW3S2QsUKBnqvEstJa3k492oiNryoorGDXVfR6-8zEge4VOjEPyAWZEfAtdEJjK1AC66YJ8tdqCdNUHpoGAvxr6DJkk_N1RQPiTH_rwrbKbKeep2a9Vl75ZyDY'
r = requests.get(screenshot_url)
with open('D:/VendorLock1/frontend/public/beat-intelligence-screenshot.png', 'wb') as f:
    f.write(r.content)
print(f"Screenshot: {r.status_code}, {len(r.content)} bytes")

html_url = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ5Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpYCiVodG1sXzk2MWRjMzY3Yjg4NjRjODA4Y2RhOTY5YzFlZmMyY2I0EgsSBxCwtvyhnxkYAZIBIQoKcHJvamVjdF9pZBITQhE4MTUzNjk0NjU3MTIwMDY0Mg&filename=&opi=89354086'
r = requests.get(html_url)
with open('D:/VendorLock1/frontend/public/beat-intelligence-ref.html', 'w', encoding='utf-8') as f:
    f.write(r.text)
print(f"HTML: {r.status_code}, {len(r.text)} bytes")