# Divano website and demo playlist

The website of Divano, an IPTV player that comes without any content, served by GitHub Pages at
[divano.dambox.ch](https://divano.dambox.ch/), and the demo
playlist the app offers as "Try the demo".

## Pages

Plain HTML, no build step (`.nojekyll`). Every page holds Italian and English: elements with class
`it` or `en` show for one language, picked from `?lang=`, the last choice, then the browser.

| Path | |
|---|---|
| `index.html` | Home: screenshots, features, the demo playlist and its credits |
| `guide/` | User guide |
| `sync/` | For sync server implementers: `openapi.yaml`, `openapi.json`, an API reference drawn by `api.js` |
| `privacy/` | Privacy policy of the app (linked from Google Play) |
| `ffmpeg/` | The LGPL source of the FFmpeg the app ships, and how it was built |
| `assets/` | Style, script, icons, Nunito (SIL OFL) and screenshots in both languages |

Each page's head carries its title and description in both languages (`data-title-*`,
`data-description-*`, swapped by `site.js`), Open Graph tags and `hreflang` links: `?lang=it` and
`?lang=en` are the two language versions, the bare URL is `x-default`. The inline script adds the
canonical that matches. A new page also goes in `sitemap.xml`. The footer links to
[dambox.ch](https://dambox.ch/), which lists Divano among its projects.

After editing `assets/site.css`, `assets/site.js` or `sync/api.js`, run `python3 tools/version-assets.py`:
it stamps their links with a content hash, so browsers don't keep the old copy (Pages caches for 10 minutes).

When the sync protocol changes, copy `docs/sync/openapi.yaml` from the app's repository into `sync/`
and regenerate the JSON: `yq -o=json sync/openapi.yaml > sync/openapi.json`.

## Demo playlist

- **40 live channels** with invented names, invented shows and generated logos.
- **Films and one series** released by the Blender Foundation under Creative Commons Attribution.

To try it, add this link as a source in the app:

    https://divano.dambox.ch/divano-demo.m3u

The XMLTV guide (`divano-demo.xml.gz`) is announced in the playlist header and loaded by itself.

### Credits

| Title | Year | Licence | Credit |
|---|---|---|---|
| Big Buck Bunny | 2008 | CC BY 3.0 | © Blender Foundation, peach.blender.org |
| Elephants Dream | 2006 | CC BY 2.5 | © Blender Foundation, orange.blender.org |
| Sintel | 2010 | CC BY 3.0 | © Blender Foundation, durian.blender.org |
| Tears of Steel | 2012 | CC BY 3.0 | © Blender Foundation, mango.blender.org |
| Caminandes 1–3 | 2013–2016 | CC BY 3.0 | © Blender Foundation, caminandes.com |

The films play from archive.org, download.blender.org and Mux's public HLS test streams; the live
channels loop Big Buck Bunny and Tears of Steel. Posters and backdrops are frames of the films.
