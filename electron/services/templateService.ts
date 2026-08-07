import { app } from 'electron';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from './storageService';

export type StoredTemplate = {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileType: 'image';
  mimeType: 'image/png' | 'image/jpeg';
  createdAt: string;
  updatedAt: string;
  fields: TextFieldData[];
};

export type TextFieldData = {
  id: string;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  value: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  backgroundColor: string;
  transparent: boolean;
  borderVisible: boolean;
  borderColor: string;
  zIndex: number;
};

const allowedExtensions = new Map<string, 'image/png' | 'image/jpeg'>([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
]);

function paths() {
  const root = path.join(app.getPath('userData'), 'template-data');
  return { root, files: path.join(root, 'files'), database: path.join(root, 'templates.json') };
}

function cleanName(name: string): string {
  const value = name.trim();
  if (!value) throw new Error('テンプレート名を入力してください。');
  if (value.length > 100) throw new Error('テンプレート名は100文字以内で入力してください。');
  return value;
}

async function load(): Promise<StoredTemplate[]> {
  return readJson(paths().database, []);
}

async function save(templates: StoredTemplate[]): Promise<void> {
  await writeJson(paths().database, templates);
}

export async function listTemplates(): Promise<StoredTemplate[]> {
  return load();
}

export async function createTemplate(name: string, sourcePath: string): Promise<StoredTemplate> {
  const templateName = cleanName(name);
  const extension = path.extname(sourcePath).toLowerCase();
  const mimeType = allowedExtensions.get(extension);
  if (!mimeType) throw new Error('PNG、JPEG、JPGファイルを選択してください。');

  const source = await fs.stat(sourcePath);
  if (!source.isFile()) throw new Error('選択されたファイルを読み込めません。');

  const id = randomUUID();
  const destination = path.join(paths().files, `${id}${extension}`);
  await fs.mkdir(paths().files, { recursive: true });
  await fs.copyFile(sourcePath, destination);

  const now = new Date().toISOString();
  const template: StoredTemplate = {
    id,
    name: templateName,
    fileName: path.basename(sourcePath),
    filePath: destination,
    fileType: 'image',
    mimeType,
    createdAt: now,
    updatedAt: now,
    fields: [],
  };

  try {
    const templates = await load();
    templates.push(template);
    await save(templates);
    return template;
  } catch (error) {
    await fs.unlink(destination).catch(() => undefined);
    throw error;
  }
}

export async function renameTemplate(id: string, name: string): Promise<StoredTemplate> {
  const templates = await load();
  const template = templates.find((item) => item.id === id);
  if (!template) throw new Error('テンプレートが見つかりません。');
  template.name = cleanName(name);
  template.updatedAt = new Date().toISOString();
  await save(templates);
  return template;
}

export async function removeTemplate(id: string): Promise<void> {
  const templates = await load();
  const template = templates.find((item) => item.id === id);
  if (!template) throw new Error('テンプレートが見つかりません。');
  await save(templates.filter((item) => item.id !== id));
  await fs.unlink(template.filePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== 'ENOENT') throw error;
  });
}

export async function getTemplatePreview(id: string): Promise<string> {
  const template = (await load()).find((item) => item.id === id);
  if (!template) throw new Error('テンプレートが見つかりません。');
  const content = await fs.readFile(template.filePath);
  return `data:${template.mimeType};base64,${content.toString('base64')}`;
}

export async function saveTemplateFields(id: string, fields: TextFieldData[]): Promise<StoredTemplate> {
  const templates = await load();
  const template = templates.find((item) => item.id === id);
  if (!template) throw new Error('テンプレートが見つかりません。');
  template.fields = fields;
  template.updatedAt = new Date().toISOString();
  await save(templates);
  return template;
}
