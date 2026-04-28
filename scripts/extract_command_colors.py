import re

html = open('D:/VendorLock1/frontend/public/command-center-ref.html', encoding='utf-8', errors='ignore').read()
colors = re.findall(r'"([a-z-]+)":\s*["\'](#[0-9a-f]+)["\']', html)
print("Color tokens from Command Center design:")
print("-" * 40)
for name, hex in colors[:50]:
    print(f'  {name}: {hex}')