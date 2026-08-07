import { ipcMain } from 'electron';

export function registerPrintHandlers(): void {
  ipcMain.handle('output:print', async (event) => {
    return new Promise<{ success: boolean; failureReason?: string }>((resolve) => {
      event.sender.print(
        {
          silent: false,
          printBackground: true,
          color: true,
          margins: { marginType: 'none' },
        },
        (success, failureReason) => resolve({ success, failureReason: failureReason || undefined }),
      );
    });
  });
}
