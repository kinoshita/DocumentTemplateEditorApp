import { useState } from 'react';
import type { TextFieldData } from '../types/template';

type Props = {
  templateName: string;
  imageSource: string;
  fields: TextFieldData[];
  onBack: () => void;
};

export function PreviewPage({ templateName, imageSource, fields, onBack }: Props) {
  const [aspectRatio, setAspectRatio] = useState(1 / 1.414);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const print = async () => {
    setBusy(true); setMessage('');
    try {
      const result = await window.electronAPI.output.print();
      if (!result.success && result.failureReason && !/cancel/i.test(result.failureReason)) setMessage(`印刷できませんでした: ${result.failureReason}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : '印刷できませんでした。'); }
    finally { setBusy(false); }
  };

  const savePdf = async () => {
    setBusy(true); setMessage('');
    try {
      const result = await window.electronAPI.output.savePdf(templateName);
      if (!result.canceled) setMessage(`PDFを保存しました: ${result.filePath ?? ''}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'PDFを保存できませんでした。'); }
    finally { setBusy(false); }
  };

  return (
    <main className="preview-shell">
      <header className="preview-header no-print">
        <button onClick={onBack}>← 編集画面に戻る</button>
        <div><p>PRINT PREVIEW</p><h1>{templateName}</h1></div>
        <div className="preview-actions">
          <button disabled={busy} onClick={() => void print()}>印刷</button>
          <button className="pdf-button" disabled={busy} onClick={() => void savePdf()}>{busy ? '処理中…' : 'PDF出力'}</button>
        </div>
      </header>
      {message && <div className="preview-message no-print" role="status">{message}</div>}
      <section className="preview-content">
        <div className="print-sheet" style={{ aspectRatio }}>
          <img src={imageSource} alt="帳票テンプレート" onLoad={(event) => setAspectRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} />
          {fields.map((field) => (
            <div
              key={field.id}
              className="preview-field"
              style={{
                left: `${field.xRatio * 100}%`, top: `${field.yRatio * 100}%`,
                width: `${field.widthRatio * 100}%`, height: `${field.heightRatio * 100}%`,
                zIndex: field.zIndex,
                fontSize: `${field.fontSize / 10}cqw`,
                fontWeight: field.fontWeight,
                textAlign: field.textAlign,
                color: field.color,
                backgroundColor: field.transparent ? 'transparent' : field.backgroundColor,
                border: field.borderVisible ? `1px solid ${field.borderColor}` : 'none',
              }}
            >{field.value}</div>
          ))}
        </div>
      </section>
    </main>
  );
}
