import type { TextFieldData } from '../types/template';

type Props = {
  field: TextFieldData | null;
  onChange: (field: TextFieldData) => void;
  onDelete: () => void;
  onDuplicate: () => void;
};

export function TextFieldToolbar({ field, onChange, onDelete, onDuplicate }: Props) {
  if (!field) {
    return <aside className="field-toolbar empty-toolbar"><div>入力欄を選択すると<br />設定を変更できます</div></aside>;
  }
  const patch = (value: Partial<TextFieldData>) => onChange({ ...field, ...value });

  return (
    <aside className="field-toolbar">
      <div className="toolbar-heading"><span>選択中</span><strong>入力欄の設定</strong></div>
      <label><span>文字の初期値</span><textarea className="toolbar-textarea" value={field.value} onChange={(event) => patch({ value: event.target.value })} /></label>
      <div className="toolbar-grid">
        <label><span>フォントサイズ</span><input type="number" min={6} max={96} value={field.fontSize} onChange={(event) => patch({ fontSize: Number(event.target.value) })} /></label>
        <label><span>文字色</span><input type="color" value={field.color} onChange={(event) => patch({ color: event.target.value })} /></label>
      </div>
      <div className="setting-group"><span>文字装飾</span><button className={field.fontWeight === 'bold' ? 'toggle active' : 'toggle'} onClick={() => patch({ fontWeight: field.fontWeight === 'bold' ? 'normal' : 'bold' })}>太字</button></div>
      <div className="setting-group"><span>文字揃え</span><div className="segmented">{(['left', 'center', 'right'] as const).map((align) => <button key={align} className={field.textAlign === align ? 'active' : ''} onClick={() => patch({ textAlign: align })}>{align === 'left' ? '左' : align === 'center' ? '中央' : '右'}</button>)}</div></div>
      <div className="toolbar-grid">
        <label><span>背景色</span><input type="color" disabled={field.transparent} value={field.backgroundColor} onChange={(event) => patch({ backgroundColor: event.target.value })} /></label>
        <label><span>枠線色</span><input type="color" disabled={!field.borderVisible} value={field.borderColor} onChange={(event) => patch({ borderColor: event.target.value })} /></label>
      </div>
      <label className="check-label"><input type="checkbox" checked={field.transparent} onChange={(event) => patch({ transparent: event.target.checked })} />背景を透明にする</label>
      <label className="check-label"><input type="checkbox" checked={field.borderVisible} onChange={(event) => patch({ borderVisible: event.target.checked })} />枠線を表示する</label>
      <div className="toolbar-actions"><button onClick={onDuplicate}>複製</button><button className="danger-outline" onClick={onDelete}>削除</button></div>
    </aside>
  );
}
