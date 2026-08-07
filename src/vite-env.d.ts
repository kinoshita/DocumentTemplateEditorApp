/// <reference types="vite/client" />

import type { TemplateData } from './types/template';

type ElectronAPI = {
  getAppVersion: () => Promise<string>;
  templates: {
    list: () => Promise<TemplateData[]>;
    chooseFile: () => Promise<string | null>;
    create: (name: string, sourcePath: string) => Promise<TemplateData>;
    rename: (id: string, name: string) => Promise<TemplateData>;
    remove: (id: string) => Promise<void>;
    getPreview: (id: string) => Promise<string>;
    saveFields: (id: string, fields: import('./types/template').TextFieldData[]) => Promise<TemplateData>;
  };
  output: {
    print: () => Promise<{ success: boolean; failureReason?: string }>;
    savePdf: (templateName: string) => Promise<{ canceled: boolean; filePath?: string }>;
  };
};

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
