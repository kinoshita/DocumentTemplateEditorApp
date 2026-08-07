import { useLayoutEffect, useRef, useState } from 'react';
import type { TextFieldData } from '../types/template';
import { TextFieldItem } from './TextFieldItem';

type Props = {
  imageSource: string;
  fields: TextFieldData[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (field: TextFieldData) => void;
};

export function TemplateCanvas({ imageSource, fields, selectedId, onSelect, onChange }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);
  const [aspectRatio, setAspectRatio] = useState(1 / 1.414);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="canvas-stage">
      <div ref={canvasRef} className="template-canvas" style={{ aspectRatio }} onPointerDown={() => onSelect(null)}>
        <img className="canvas-image" src={imageSource} alt="帳票テンプレート" onLoad={(event) => setAspectRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} />
        {fields.map((field) => <TextFieldItem key={field.id} field={field} selected={selectedId === field.id} canvasWidth={width} onSelect={() => onSelect(field.id)} onChange={onChange} />)}
      </div>
    </div>
  );
}
