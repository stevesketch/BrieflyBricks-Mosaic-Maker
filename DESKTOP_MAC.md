# Running BrickMosaic Studio on macOS as a Standalone App

BrickMosaic Studio can be run as a standalone executable application on macOS in two ways:
1. **Native Standalone Executable (`.app`) via Electron**
2. **Native Dock App via Safari / Chrome PWA**

---

## 1. Native Standalone Executable (Electron .app)

### What's Included
The project includes complete Electron desktop packaging with:
- Dedicated macOS Application Menu (Undo, Redo, Zoom, Fullscreen, etc.)
- Native traffic-light window controls
- Offline local storage support
- Pre-configured scripts for Apple Silicon (M1/M2/M3/M4) and Intel Macs

### Build & Package Commands

| Command | Description |
| :--- | :--- |
| `npm run package:mac` | Packages the native macOS `.app` for **Apple Silicon** (`arm64` - M1/M2/M3/M4) |
| `npm run package:mac:intel` | Packages the native macOS `.app` for **Intel Macs** (`x64`) |
| `npm run package:mac:all` | Packages for **both** Apple Silicon and Intel |
| `npm run electron:start` | Launches the app directly in an Electron desktop window for local testing |

### Where to Find the Packaged App
After running `npm run package:mac`, you will find:
```
dist-mac/
  └── BrickMosaic Studio-darwin-arm64/
      └── BrickMosaic Studio.app
  └── BrickMosaic-Studio-macOS-arm64.tar.gz
  └── BrickMosaic-Studio-macOS-arm64.zip
```

### Running on macOS
1. Double-click `BrickMosaic Studio.app` or move it to your `/Applications` folder.
2. If macOS displays *"BrickMosaic Studio cannot be opened because it is from an unidentified developer"*:
   - Right-click (or Control-click) `BrickMosaic Studio.app` and choose **Open**.
   - Click **Open** in the confirmation dialog. (You only need to do this once).
   - Alternatively, open **System Settings > Privacy & Security** and click **Open Anyway**.

---

## 2. One-Click Dock App (Safari / Chrome PWA)

If you don't want to compile binaries or run Node:
- **In Safari (macOS Sonoma or later)**:
  1. Open the app URL in Safari.
  2. Click **File > Add to Dock...** in the top menu bar.
  3. Click **Add**.
  4. A standalone `BrickMosaic.app` is placed in your Dock and `~/Applications` folder. It runs in its own native window without any browser address bar or tabs.
- **In Google Chrome / Edge**:
  1. Click the **Install** icon in the right side of the URL bar (or Menu > "Save and Share" > "Install BrickMosaic Studio").
  2. The app installs directly into macOS Applications.
