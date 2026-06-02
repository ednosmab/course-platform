'use client';

import React, { useRef, useState } from 'react';
import { YStack, XStack, Text, Button, Icon } from '@projeto/ui';
import { StorageService } from '@projeto/core';
import { useEditor } from '../../context/EditorContext';
import type { ImageBlock } from '@projeto/types';

/**
 * Image block settings that are exclusive to the certificate editor.
 *
 * Boundary rule (SDR-001): o `BlockSettings.tsx` (lesson) não deve
 * carregar branches `mode === 'certificate'`. Todos os controlos
 * exclusivos do cert — upload, flag "Imagem de Fundo" — vivem aqui
 * e são renderizados pelo `CertificateEditor` como slot.
 *
 * NOTA: o `objectFit` continua a viver no `BlockSettings` (compartilhado
 * entre lesson e cert). Aqui só adicionamos o que é genuinamente cert-only.
 */
export const CertificateImageSettings: React.FC = () => {
  const { blocks, activeBlockId, updateBlock, courseId } = useEditor();
  const activeBlock = blocks.find((b) => b.id === activeBlockId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!activeBlock || activeBlock.type !== 'image') return null;
  const imageBlock = activeBlock as ImageBlock;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !courseId) return;
    if (file.size > 5 * 1024 * 1024) { alert('Arquivo muito grande. Máximo: 5MB.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { alert('Formato não suportado. Use JPEG, PNG ou WebP.'); return; }
    setUploading(true);
    try {
      const url = await StorageService.uploadCertificateImage(file, courseId, imageBlock.id);
      if (url) updateBlock(imageBlock.id, { url });
      else alert('Erro ao enviar imagem.');
    } catch { alert('Erro ao enviar imagem.'); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  };

  return (
    <YStack
      gap="$2"
      pt="$2"
      mt="$2"
      borderTopWidth={1}
      borderTopColor="$border"
    >
      <Text fontSize={11} fontWeight="600">UPLOAD DE IMAGEM (CERT)</Text>

      <XStack ai="center" jc="space-between">
        <Text fontSize={11} fontWeight="500">Imagem de Fundo</Text>
        <input
          type="checkbox"
          checked={!!imageBlock.styles?.isBackground}
          onChange={(e) => {
            const isBg = e.target.checked;
            updateBlock(imageBlock.id, {
              styles: {
                ...imageBlock.styles,
                isBackground: isBg,
                objectFit: isBg ? 'cover' : (imageBlock.styles?.objectFit || 'contain'),
              },
            });
          }}
          style={{ cursor: 'pointer', width: 16, height: 16 }}
        />
      </XStack>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <Button
        variant="ghost"
        borderWidth={1}
        borderColor="$border"
        onPress={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Icon name="Upload" size={14} />
        <Text ml={4} fontSize={12}>{uploading ? 'Enviando...' : 'Selecionar imagem'}</Text>
      </Button>
    </YStack>
  );
};
