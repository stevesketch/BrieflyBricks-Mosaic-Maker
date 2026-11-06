const { contextBridge } = require('electron');

// Expose safe desktop environment info if needed by frontend
contextBridge.exposeInMainWorld('desktopApp', {
  isElectron: true,
  platform: process.platform,
});
