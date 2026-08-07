import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { registerTemplateHandlers } from './ipc/templateHandlers';
import { registerPrintHandlers } from './ipc/printHandlers';
import { registerPdfHandlers } from './ipc/pdfHandlers';

const isDevelopment = !app.isPackaged;

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '帳票テンプレート編集',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDevelopment) {
    void window.loadURL('http://localhost:5173');
  } else {
    void window.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  ipcMain.handle('app:get-version', () => app.getVersion());
  registerTemplateHandlers();
  registerPrintHandlers();
  registerPdfHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
