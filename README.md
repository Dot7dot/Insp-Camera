# Insp Camera

**Public app:** https://dot7dot.github.io/Insp-Camera/

A mobile-first inspiration camera for creators. Capture a moment, tap a surrounding folder to save it, and revisit your collection with photo adjustments and notes.

為創作者打造的靈感相機：快速拍攝並分類，重新發現收藏中的創意線索。

## Features

- Black / orange design system with glossy "jelly" orange buttons that squish and bounce on tap (respects *reduce motion*).
- Minimal home screen with Capture and Collection entrances, a collection preview, and a "recent inspiration" strip.
- **Capture:** live camera with front/back switching, flash + haptic feedback, native mobile camera fallback, and photo import. The surrounding folders are juicy, fizzing orange cells with jelly feedback; tapping one after a shot flies the photo into it. Save to a brand-new folder straight from the capture screen. Keyboard: `Space` shoots/saves, `1`–`9` picks or saves to a folder, `Esc` retakes.
- Six initial folders (up to 12); create, rename, and delete folders. The camera frame adapts to folder count, with an undivided frame for a single folder. The last folder you used is remembered.
- **Collection:** single-photo view or grid view. Tap any photo to open a full-screen viewer with pinch / double-tap / wheel zoom, pan, swipe between photos, swipe down to close, and keyboard control. Swipe the main photo to move between photos.
- **Save & export:** the 儲存 button (photo toolbar and full-screen viewer) saves a single photo — on phones it opens the share sheet, where 「儲存影像」 puts it in the photo album; on computers it downloads. The 匯出 button in Collection lets you tick folders and save all their photos to the phone's album (in batches of up to 20 per share sheet), or download them as one ZIP with a sub-folder per folder.
- Permanent rotate and crop (drag, pinch or wheel zoom; original, 1:1, 4:5, 3:4, 9:16, 4:3, 16:9), restore original, rename photos, autosaved notes, move between folders, share (Web Share), download, and delete with undo. Deleting a folder asks once in a small confirm, moves its photos to the neighbouring folder, and can be undone.
- Drag-and-drop or paste images to import. One-tap removal of the sample photos.
- Phone/browser back button works across pages and closes the viewer. Dialogs become bottom sheets on phones.
- Works offline after the first visit (network-first service worker caching only the app's own files).
- IndexedDB storage on the current browser/device; persistent storage is requested on the first save. Photos are not uploaded or synchronized. Clearing website data removes the collection; download important images for backup.

## Run locally

No build step or dependencies are required.

```sh
python3 -m http.server 8080 --directory dist
```

Visit http://localhost:8080. Camera access requires HTTPS or localhost; on mobile use the deployed HTTPS site. On iPhone you may add the site to your home screen from Safari's Share menu. This is a web app, not an App Store binary.

## Layout

- `dist/index.html` — app shell
- `dist/app.js` — camera, IndexedDB storage, folders, album, notes, photo edits
- `dist/styles.css` — responsive black/orange interface
- `dist/sw.js` — offline cache for the app shell (never touches photos)
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
