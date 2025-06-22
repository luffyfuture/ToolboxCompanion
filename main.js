const { app, BrowserWindow } = require('electron');
const path = require('path');
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  // Load Vue application from dist/electron/index.html
  win.loadURL(`file://${path.join(__dirname, '../dist/electron/index.html')}`);
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
  win.on('closed', () => {
    win = null;
  });
}
app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
