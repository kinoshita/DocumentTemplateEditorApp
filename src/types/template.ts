export type TemplateData = {
  id: string;
  name: string;
  fileName: string;
  fileType: 'image';
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
