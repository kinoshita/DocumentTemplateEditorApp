import { useEffect, useMemo, useState } from 'react';
import { TemplateCanvas } from '../components/TemplateCanvas';
import { TextFieldToolbar } from '../components/TextFieldToolbar';
import type { TemplateData, TextFieldData } from '../types/template';
import { PreviewPage } from './PreviewPage';

type Props = { initialTemplateId?: string; onBack: () => void };

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message.replace(/^.*Error: /, '') : '処理に失敗しました。';
}

export function EditorPage({ initialTemplateId, onBack }: Props) {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [templateId, setTemplateId] = useState(initialTemplateId ?? '');
  const [imageSource, setImageSource] = useState('');
  const [fields, setFields] = useState<TextFieldData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState('');
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    window.electronAPI.templates.list().then((items) => {
      setTemplates(items);
      if (!templateId && items[0]) setTemplateId(items[0].id);
    }).catch((error) => setNotice(messageOf(error))).finally(() => setBusy(false));
  }, []);

  useEffect(() => {
    if (!templateId) { setImageSource(''); setFields([]); return; }
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setBusy(true);
    window.electronAPI.templates.getPreview(templateId).then((source) => {
      setImageSource(source);
      setFields(template.fields);
      setSelectedId(null);
      setDirty(false);
    }).catch((error) => setNotice(messageOf(error))).finally(() => setBusy(false));
  }, [templateId, templates]);

  const selected = useMemo(() => fields.find((field) => field.id === selectedId) ?? null, [fields, selectedId]);
  const changeField = (next: TextFieldData) => {
    setFields((current) => current.map((field) => field.id === next.id ? next : field));
    setDirty(true);
  };
  const addField = () => {
    if (!templateId) return;
    const id = crypto.randomUUID();
    const offset = Math.min(fields.length * .015, .18);
    const field: TextFieldData = {
      id, xRatio: .1 + offset, yRatio: .1 + offset, widthRatio: .3, heightRatio: .06,
      value: '', fontSize: 16, fontWeight: 'normal', textAlign: 'left', color: '#172033',
      backgroundColor: '#ffffff', transparent: true, borderVisible: false,
      borderColor: '#172033', zIndex: fields.length + 1,
    };
    setFields((current) => [...current, field]);
    setSelectedId(id);
    setDirty(true);
  };
  const deleteSelected = () => {
    if (!selectedId) return;
    setFields((current) => current.filter((field) => field.id !== selectedId));
    setSelectedId(null);
    setDirty(true);
  };
  const duplicateSelected = () => {
    if (!selected) return;
    const duplicate = { ...selected, id: crypto.randomUUID(), xRatio: Math.min(selected.xRatio + .025, 1 - selected.widthRatio), yRatio: Math.min(selected.yRatio + .025, 1 - selected.heightRatio), zIndex: fields.length + 1 };
    setFields((current) => [...current, duplicate]);
    setSelectedId(duplicate.id);
    setDirty(true);
  };
  const save = async () => {
    if (!templateId) return;
    setBusy(true); setNotice('');
    try {
      const updated = await window.electronAPI.templates.saveFields(templateId, fields);
      setTemplates((current) => current.map((item) => item.id === updated.id ? updated : item));
      setDirty(false); setNotice('編集内容を保存しました。');
    } catch (error) { setNotice(messageOf(error)); }
    finally { setBusy(false); }
  };

  const activeTemplate = templates.find((template) => template.id === templateId);
  if (previewing && activeTemplate) {
    return <PreviewPage templateName={activeTemplate.name} imageSource={imageSource} fields={fields} onBack={() => setPreviewing(false)} />;
  }

  return (
    <main className="editor-shell">
      <header className="editor-header">
        <button className="back-button" onClick={onBack}>← テンプレート管理</button>
        <div className="editor-title"><p>REPORT EDITOR</p><h1>帳票編集</h1></div>
        <label className="template-select"><span>テンプレート</span><select value={templateId} disabled={busy} onChange={(event) => { if (!dirty || window.confirm('未保存の変更を破棄しますか？')) setTemplateId(event.target.value); }}><option value="">選択してください</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label>
        <div className="editor-actions">
          <button disabled={!templateId || busy} onClick={addField}>＋ 記入欄追加</button>
          <button disabled={!selectedId || busy} onClick={deleteSelected}>削除</button>
          <button disabled={!templateId || !imageSource || busy} onClick={() => { setSelectedId(null); setPreviewing(true); }}>プレビュー</button>
          <button className="save-button" disabled={!templateId || !dirty || busy} onClick={() => void save()}>{busy ? '処理中…' : '保存'}</button>
        </div>
      </header>
      {notice && <div className="editor-notice" role="status">{notice}</div>}
      <div className="editor-workspace">
        <section className="canvas-column">
          {!templateId ? <div className="editor-empty">登録済みテンプレートを選択してください。</div> : imageSource ? <TemplateCanvas imageSource={imageSource} fields={fields} selectedId={selectedId} onSelect={setSelectedId} onChange={changeField} /> : <div className="editor-empty">テンプレートを読み込んでいます…</div>}
        </section>
        <TextFieldToolbar field={selected} onChange={changeField} onDelete={deleteSelected} onDuplicate={duplicateSelected} />
      </div>
    </main>
  );
}
