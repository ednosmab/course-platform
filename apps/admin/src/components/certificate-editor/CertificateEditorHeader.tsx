'use client';

import React from 'react';
import { EditorHeader } from '../editor/EditorHeader';

export const CertificateEditorHeader: React.FC<{ courseId: string }> = ({ courseId }) => {
  return <EditorHeader courseId={courseId} saveActionLabel="Salvar" />;
};
