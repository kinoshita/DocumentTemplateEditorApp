import { BrowserWindow, app, dialog, ipcMain } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

function safeFileName(value: unknown): string {
  const name = typeof value === 'string' ? value.trim() : '';
  const sanitized = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/[. ]+$/, '');
  return sanitized || '帳票';
}

export function registerPdfHandlers(): void {
  ipcMain.handle('output:pdf', async (event, input: unknown) => {
    const { templateName } = (input ?? {}) as { templateName?: unknown };
    const owner = BrowserWindow.fromWebContents(event.sender) ?? undefined;
    const options = {
      title: 'PDFの保存先を選択',
      defaultPath: path.join(app.getPath('documents'), `${safeFileName(templateName)}.pdf`),
      filters: [{ name: 'PDFファイル', extensions: ['pdf'] }],
      properties: ['createDirectory', 'showOverwriteConfirmation'] as ('createDirectory' | 'showOverwriteConfirmation')[],
    };
    const result = owner ? await dialog.showSaveDialog(owner, options) : await dialog.showSaveDialog(options);
    if (result.canceled || !result.filePath) return { canceled: true };

    const data = await event.sender.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      pageSize: 'A4',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    await fs.writeFile(result.filePath, data);
    return { canceled: false, filePath: result.filePath };
  });
}
