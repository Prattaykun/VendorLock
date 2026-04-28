import re

with open('D:/VendorLock1/frontend/public/beat-intelligence-ref.html') as f:
    html = f.read()

colors = re.findall(r'"([a-z-]+)":\s*["\'](#[0-9a-f]+)["\']', html)
print("Color tokens from Stitch design:")
print("-" * 40)
for name, hex in colors:
    print(f'  {name}: {hex}')