import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TextFieldData } from '../types/template';

type Props = {
  field: TextFieldData;
  selected: boolean;
  canvasWidth: number;
  onSelect: () => void;
  onChange: (next: TextFieldData) => void;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export function TextFieldItem({ field, selected, canvasWidth, onSelect, onChange }: Props) {
  const beginPointerAction = (event: ReactPointerEvent, mode: 'move' | 'resize') => {
    event.preventDefault();
    event.stopPropagation();
    onSelect();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const canvas = target.closest('.template-canvas') as HTMLElement | null;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const initial = field;

    const move = (pointerEvent: PointerEvent) => {
      const dx = (pointerEvent.clientX - startX) / rect.width;
      const dy = (pointerEvent.clientY - startY) / rect.height;
      if (mode === 'move') {
        onChange({
          ...initial,
          xRatio: clamp(initial.xRatio + dx, 0, 1 - initial.widthRatio),
          yRatio: clamp(initial.yRatio + dy, 0, 1 - initial.heightRatio),
        });
      } else {
        onChange({
          ...initial,
          widthRatio: clamp(initial.widthRatio + dx, 0.05, 1 - initial.xRatio),
          heightRatio: clamp(initial.heightRatio + dy, 0.025, 1 - initial.yRatio),
        });
      }
    };
    const finish = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', finish);
      target.removeEventListener('pointercancel', finish);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', finish);
    target.addEventListener('pointercancel', finish);
  };

  return (
    <div
      className={`text-field-item${selected ? ' selected' : ''}`}
      style={{
        left: `${field.xRatio * 100}%`, top: `${field.yRatio * 100}%`,
        width: `${field.widthRatio * 100}%`, height: `${field.heightRatio * 100}%`,
        zIndex: field.zIndex,
        backgroundColor: field.transparent ? 'transparent' : field.backgroundColor,
        borderColor: field.borderVisible ? field.borderColor : 'transparent',
      }}
      onPointerDown={onSelect}
    >
      <button className="move-handle" title="ドラッグして移動" onPointerDown={(event) => beginPointerAction(event, 'move')}>⋮⋮</button>
      <textarea
        value={field.value}
        aria-label="入力文字"
        spellCheck={false}
        style={{
          fontSize: `${field.fontSize * Math.max(canvasWidth, 1) / 1000}px`,
          fontWeight: field.fontWeight,
          textAlign: field.textAlign,
          color: field.color,
        }}
        onPointerDown={(event) => { event.stopPropagation(); onSelect(); }}
        onChange={(event) => onChange({ ...field, value: event.target.value })}
      />
      <button className="resize-handle" aria-label="入力欄のサイズを変更" onPointerDown={(event) => beginPointerAction(event, 'resize')} />
    </div>
  );
}
