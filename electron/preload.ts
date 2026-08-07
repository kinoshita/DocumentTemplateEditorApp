import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version'),
  templates: {
    list: () => ipcRenderer.invoke('templates:list'),
    chooseFile: () => ipcRenderer.invoke('templates:choose-file'),
    create: (name: string, sourcePath: string) =>
      ipcRenderer.invoke('templates:create', { name, sourcePath }),
    rename: (id: string, name: string) => ipcRenderer.invoke('templates:rename', { id, name }),
    remove: (id: string) => ipcRenderer.invoke('templates:remove', { id }),
    getPreview: (id: string) => ipcRenderer.invoke('templates:get-preview', { id }),
    saveFields: (id: string, fields: unknown[]) =>
      ipcRenderer.invoke('templates:save-fields', { id, fields }),
  },
  output: {
    print: () => ipcRenderer.invoke('output:print'),
    savePdf: (templateName: string) => ipcRenderer.invoke('output:pdf', { templateName }),
  },
});
