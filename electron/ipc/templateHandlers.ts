import { BrowserWindow, dialog, ipcMain, type OpenDialogOptions } from 'electron';
import {
  createTemplate,
  getTemplatePreview,
  listTemplates,
  removeTemplate,
  renameTemplate,
  saveTemplateFields,
  type StoredTemplate,
  type TextFieldData,
} from '../services/templateService';

type PublicTemplate = Omit<StoredTemplate, 'filePath' | 'mimeType'>;

function publicTemplate(template: StoredTemplate): PublicTemplate {
  const { filePath: _filePath, mimeType: _mimeType, ...safeTemplate } = template;
  return safeTemplate;
}

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string') throw new Error(`${label}が不正です。`);
}

export function registerTemplateHandlers(): void {
  ipcMain.handle('templates:list', async () => (await listTemplates()).map(publicTemplate));

  ipcMain.handle('templates:choose-file', async (event) => {
    const owner = BrowserWindow.fromWebContents(event.sender) ?? undefined;
    const options: OpenDialogOptions = {
      title: 'テンプレート画像を選択',
      properties: ['openFile'],
      filters: [{ name: '画像ファイル', extensions: ['png', 'jpg', 'jpeg'] }],
    };
    const result = owner ? await dialog.showOpenDialog(owner, options) : await dialog.showOpenDialog(options);
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('templates:create', async (_event, input: unknown) => {
    const { name, sourcePath } = input as { name?: unknown; sourcePath?: unknown };
    assertString(name, 'テンプレート名');
    assertString(sourcePath, 'ファイルパス');
    return publicTemplate(await createTemplate(name, sourcePath));
  });

  ipcMain.handle('templates:rename', async (_event, input: unknown) => {
    const { id, name } = input as { id?: unknown; name?: unknown };
    assertString(id, 'ID');
    assertString(name, 'テンプレート名');
    return publicTemplate(await renameTemplate(id, name));
  });

  ipcMain.handle('templates:remove', async (_event, input: unknown) => {
    const { id } = input as { id?: unknown };
    assertString(id, 'ID');
    await removeTemplate(id);
  });

  ipcMain.handle('templates:get-preview', async (_event, input: unknown) => {
    const { id } = input as { id?: unknown };
    assertString(id, 'ID');
    return getTemplatePreview(id);
  });

  ipcMain.handle('templates:save-fields', async (_event, input: unknown) => {
    const { id, fields } = input as { id?: unknown; fields?: unknown };
    assertString(id, 'ID');
    if (!Array.isArray(fields)) throw new Error('入力欄データが不正です。');
    const valid = fields.every((field) => {
      if (!field || typeof field !== 'object') return false;
      const value = field as Partial<TextFieldData>;
      return typeof value.id === 'string'
        && ['xRatio', 'yRatio', 'widthRatio', 'heightRatio', 'fontSize', 'zIndex'].every(
          (key) => Number.isFinite(value[key as keyof TextFieldData]),
        )
        && typeof value.value === 'string';
    });
    if (!valid) throw new Error('入力欄データが不正です。');
    return publicTemplate(await saveTemplateFields(id, fields as TextFieldData[]));
  });
}
