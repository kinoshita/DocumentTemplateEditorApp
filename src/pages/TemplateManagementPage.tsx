import { useEffect, useState } from 'react';
import { TemplateList } from '../components/TemplateList';
import type { TemplateData } from '../types/template';

function errorMessage(error: unknown): string {
  if (!(error instanceof Error)) return '処理に失敗しました。';
  const marker = 'Error: ';
  const index = error.message.lastIndexOf(marker);
  return index >= 0 ? error.message.slice(index + marker.length) : error.message;
}

export function TemplateManagementPage({ onEdit }: { onEdit: (id?: string) => void }) {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [name, setName] = useState('');
  const [filePath, setFilePath] = useState('');
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    window.electronAPI.templates.list()
      .then(setTemplates)
      .catch((error) => setMessage({ type: 'error', text: errorMessage(error) }))
      .finally(() => setBusy(false));
  }, []);

  const chooseFile = async () => {
    const selected = await window.electronAPI.templates.chooseFile();
    if (!selected) return;
    setFilePath(selected);
    if (!name.trim()) setName(selected.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, '') ?? '');
  };

  const create = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const created = await window.electronAPI.templates.create(name, filePath);
      setTemplates((current) => [...current, created]);
      setName('');
      setFilePath('');
      setMessage({ type: 'success', text: 'テンプレートを登録しました。' });
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const rename = async (id: string, newName: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const updated = await window.electronAPI.templates.rename(id, newName);
      setTemplates((current) => current.map((item) => item.id === id ? updated : item));
      setMessage({ type: 'success', text: 'テンプレート名を変更しました。' });
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error) });
      throw error;
    } finally {
      setBusy(false);
    }
  };

  const remove = async (template: TemplateData) => {
    if (!window.confirm(`「${template.name}」を削除しますか？\nこの操作は元に戻せません。`)) return;
    setBusy(true);
    setMessage(null);
    try {
      await window.electronAPI.templates.remove(template.id);
      setTemplates((current) => current.filter((item) => item.id !== template.id));
      setMessage({ type: 'success', text: 'テンプレートを削除しました。' });
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark">R</div>
        <div><p>REPORT TEMPLATE EDITOR</p><h1>テンプレート管理</h1></div>
        <span className="phase-badge">PHASE 2</span>
        <button className="header-button" onClick={() => onEdit()}>帳票編集へ</button>
      </header>

      <div className="page-content">
        <section className="panel registration-panel">
          <div className="section-heading"><div><span className="step-number">01</span><h2>新規テンプレート登録</h2></div><p>PNG / JPEG / JPG</p></div>
          <div className="registration-grid">
            <label><span>テンプレート名</span><input value={name} maxLength={100} placeholder="例：請求書 A4縦" onChange={(event) => setName(event.target.value)} /></label>
            <label><span>テンプレートファイル</span><div className="file-picker"><input readOnly value={filePath} placeholder="ファイルを選択してください" /><button className="secondary-button" disabled={busy} onClick={() => void chooseFile()}>ファイル選択</button></div></label>
            <button className="primary-button" disabled={busy || !name.trim() || !filePath} onClick={() => void create()}>{busy ? '処理中…' : 'テンプレート登録'}</button>
          </div>
          {message && <div role="status" className={`notice ${message.type}`}>{message.text}</div>}
        </section>

        <section className="panel list-panel">
          <div className="section-heading"><div><span className="step-number">02</span><h2>登録済みテンプレート</h2></div><p>{templates.length} 件</p></div>
          <TemplateList templates={templates} busy={busy} onRename={rename} onRemove={remove} onEdit={onEdit} />
        </section>
      </div>
    </main>
  );
}
