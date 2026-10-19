# Stamps a content hash on the CSS and JS links of every page (site.css?v=…), so browsers
# fetch them again after a change instead of using a cached copy. Run after editing them.
import hashlib, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
assets = {'site.css': root / 'assets/site.css', 'site.js': root / 'assets/site.js', 'api.js': root / 'sync/api.js'}
versions = {name: hashlib.sha256(path.read_bytes()).hexdigest()[:8] for name, path in assets.items()}
for page in root.glob('**/index.html'):
    text = page.read_text()
    for name, v in versions.items():
        text = re.sub(r'(href|src)="([^"]*%s)(\?v=[0-9a-f]+)?"' % re.escape(name), r'\1="\2?v=%s"' % v, text)
    page.write_text(text)
print(versions)
