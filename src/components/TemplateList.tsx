import { useEffect, useState } from 'react';
import type { TemplateData } from '../types/template';

type Props = {
  templates: TemplateData[];
  busy: boolean;
  onRename: (id: string, name: string) => Promise<void>;
  onRemove: (template: TemplateData) => Promise<void>;
  onEdit: (id: string) => void;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

function TemplateThumbnail({ id, name }: { id: string; name: string }) {
  const [source, setSource] = useState('');

  useEffect(() => {
    let active = true;
    window.electronAPI.templates.getPreview(id).then((value) => {
      if (active) setSource(value);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [id]);

  return source
    ? <img className="template-thumbnail" src={source} alt={`${name}のプレビュー`} />
    : <div className="template-thumbnail thumbnail-placeholder">IMAGE</div>;
}

export function TemplateList({ templates, busy, onRename, onRemove, onEdit }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (templates.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">▧</span>
        <h3>テンプレートはまだありません</h3>
        <p>上のフォームからPNGまたはJPEG画像を登録してください。</p>
      </div>
    );
  }

  return (
    <div className="template-table-wrap">
      <table className="template-table">
        <thead><tr><th>テンプレート</th><th>登録日時</th><th>更新日時</th><th><span className="sr-only">操作</span></th></tr></thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id}>
              <td>
                <div className="template-identity">
                  <TemplateThumbnail id={template.id} name={template.name} />
                  <div>
                    {editingId === template.id ? (
                      <input
                        className="inline-input"
                        value={editingName}
                        maxLength={100}
                        autoFocus
                        onChange={(event) => setEditingName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') setEditingId(null);
                          if (event.key === 'Enter' && editingName.trim()) {
                            void onRename(template.id, editingName).then(() => setEditingId(null));
                          }
                        }}
                      />
                    ) : <strong>{template.name}</strong>}
                    <small>{template.fileName}</small>
                  </div>
                </div>
              </td>
              <td>{formatDate(template.createdAt)}</td>
              <td>{formatDate(template.updatedAt)}</td>
              <td>
                <div className="row-actions">
                  {editingId === template.id ? (
                    <>
                      <button className="text-button" disabled={busy || !editingName.trim()} onClick={() => void onRename(template.id, editingName).then(() => setEditingId(null))}>保存</button>
                      <button className="text-button muted" disabled={busy} onClick={() => setEditingId(null)}>取消</button>
                    </>
                  ) : (
                    <>
                      <button className="text-button" disabled={busy} onClick={() => onEdit(template.id)}>編集</button>
                      <button className="text-button" disabled={busy} onClick={() => { setEditingId(template.id); setEditingName(template.name); }}>名称変更</button>
                      <button className="text-button danger" disabled={busy} onClick={() => void onRemove(template)}>削除</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
