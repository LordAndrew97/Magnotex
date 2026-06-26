import re
import urllib.request
from pathlib import Path

base = Path('.')
img_dir = base / 'assets' / 'images'
img_dir.mkdir(exist_ok=True, parents=True)

files = [base / 'magnotex_propuesta.html', base / 'soluciones_magnotex.html', base / 'catalogo_magnotex.html']
pattern = re.compile(r'https://edredonesmagnotex\.com/wp-content/uploads/[^\s)\'\"<>]+')

for path in files:
    text = path.read_text(encoding='utf-8')
    urls = list(dict.fromkeys(pattern.findall(text)))
    for url in urls:
        name = url.split('/')[-1]
        dest = img_dir / name
        if not dest.exists():
            urllib.request.urlretrieve(url, dest)
            print(f'DOWNLOADED {url} -> {dest}')
        else:
            print(f'EXISTS {dest}')
        text = text.replace(url, 'assets/images/' + name)
    path.write_text(text, encoding='utf-8')

print('DONE')
