# Insp Camera

**Public app:** https://dot7dot.github.io/Insp-Camera/

A mobile-first inspiration camera for creators. Capture a moment, tap a surrounding folder to save it, and revisit your collection with photo adjustments and notes.

為創作者打造的靈感相機：快速拍攝並分類，重新發現收藏中的創意線索。

## Features

- Minimal home screen with Camera and Collection entrances.
- Live camera, native mobile camera fallback, and photo import.
- Six initial folders; create, rename, and delete folders. The surrounding camera frame adapts to folder count, with an undivided frame for a single folder.
- Folder tabs, previous/next buttons, photo slider, and thumbnails.
- Preview zoom, permanent rotate and crop with drag/zoom and aspect ratios, plus restore original.
- Autosaved notes, folder moves, photo download, and deletion.
- IndexedDB storage on the current browser/device. Photos are not uploaded or synchronized. Clearing website data removes the collection; download important images for backup.
- Example photos are clearly marked as samples and can be deleted.

## Run locally

No build step or dependencies are required.

```sh
python3 -m http.server 8080 --directory dist
```

Visit http://localhost:8080. Camera access requires HTTPS or localhost; on mobile use the deployed HTTPS site. On iPhone you may add the site to your home screen from Safari's Share menu. This is a web app, not an App Store binary.

## Layout

- `dist/index.html` — app shell
- `dist/app.js` — camera, IndexedDB storage, folders, album, notes, photo edits
- `dist/styles.css` — responsive interface
- `dist/assets/` — sample photographs from Unsplash
- `.openai/hosting.json` — Sites hosting configuration

Interface: Traditional Chinese with English editorial headings. Supports current mobile Safari and Chrome with IndexedDB and Canvas. No account or backend is required.

## GitHub Pages deployment

Pushes to `main` and manual runs deploy through `.github/workflows/pages.yml`.
Only `dist/` is uploaded; the repository settings and development files are excluded.
GitHub Pages must use **GitHub Actions** as its publishing source, with HTTPS enforced.
No custom domain or token is required. Workflow actions are pinned to immutable commit SHAs.
Checkout does not persist credentials. Only the deployment job has `pages: write` and `id-token: write`; source access remains read-only.

Run the dependency-free pre-deployment check:

```sh
node scripts/check-site.mjs
```

## Privacy and security

- Photos and notes remain in the visitor's browser. There is no upload endpoint, account system, analytics, advertising, or external font request.
- A CSP restricts scripts and connections to the same origin and blocks plugins, base-URL injection, and form submissions. Inline styles remain necessary for the camera layout and crop controls; inline scripts and eval are not allowed.
- Camera access needs browser permission. Audio is never requested, and live tracks stop when leaving the camera or hiding the page.
- Imports accept supported raster image types, at most 25 MiB and 64 megapixels. They are re-encoded locally into JPEG (maximum 2400 pixels on the longest edge), dropping source EXIF metadata.
- Stored data is not additionally encrypted or password protected. GitHub Pages project paths on the same owner origin are not security boundaries; other trusted/untrusted apps hosted at `dot7dot.github.io` share browser-origin privileges. The database is path-namespaced to avoid accidental collisions, not to provide isolation.
- GitHub may process ordinary website access logs. Each visitor can read the [privacy explanation](https://dot7dot.github.io/Insp-Camera/privacy.html).
- The previous Sites domain and GitHub Pages have different storage origins; collections do not automatically transfer. Download/re-import photos when moving between them.

The content checks and storage/interaction tests do not replace a browser or security audit. Test camera permission, import, crop, and download on actual iOS/Android devices.
