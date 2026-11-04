# Insp Camera

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
