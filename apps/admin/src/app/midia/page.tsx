'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  YStack,
  XStack,
  Text,
  Icon,
  Theme,
  Button,
  Card,
  Spinner,
  Input,
  color,
  FilterBar,
} from '@projeto/ui';
import { AdminHeader } from '../../components/AdminHeader';
import { MediaService, AuthService } from '@projeto/core';
import type { MediaFile } from '@projeto/types';

const BRAND_GRADIENT = `linear-gradient(135deg, ${color.cwGradientFrom}, ${color.cwGradientTo})`;

/**
 * @description Admin page for managing the media library. Supports upload,
 * browsing, preview, and deletion of media files.
 */
export default function MidiaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name-az' | 'name-za'>('recent');
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);

  // Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Preview states
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const profile = await AuthService.getCurrentProfile();
        if (!cancelled) setUserProfile({
          full_name: profile?.full_name ?? 'Usuário',
          email: profile?.email ?? '',
        });

        const media = await MediaService.listMedia();
        if (!cancelled) setMediaFiles(media);
      } catch (err) {
        console.error('Error loading media:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const filteredMedia = mediaFiles.filter((m) => {
    const matchesSearch = search === '' ||
      m.name.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'all' || m.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const sortMedia = (a: MediaFile, b: MediaFile) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name-az':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-za':
        return (b.name || '').localeCompare(a.name || '');
      default:
        return 0;
    }
  };

  const sortedMedia = [...filteredMedia].sort(sortMedia);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert('Arquivo excede o limite de 100MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const newMedia = await response.json();
      setMediaFiles(prev => [newMedia, ...prev]);
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este arquivo?')) return;

    try {
      await MediaService.deleteMedia(mediaId);
      setMediaFiles(prev => prev.filter(m => m.id !== mediaId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir arquivo';
      alert(message);
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return 'Image';
      case 'video': return 'Video';
      default: return 'FileText';
    }
  };

  const filterLabel = typeFilter === 'all' ? null : typeFilter === 'image' ? 'Imagens' : typeFilter === 'video' ? 'Vídeos' : 'Documentos';

  return (
    <Theme name="cloudWhite">
      <YStack bg="$background" minHeight="100vh">
        <AdminHeader userProfile={userProfile} onLogout={handleLogout} />

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          {/* Hero Header */}
          <YStack mb={32} gap={16}>
            <XStack ai="center" jc="space-between" flexWrap="wrap" gap={16}>
              <YStack gap={4}>
                <Text fontFamily="$display" fontSize={32} fontWeight="$6" letterSpacing={-0.5}>
                  Biblioteca de Mídias
                </Text>
                <Text fontSize={15} color="$textMuted">
                  Gerencie imagens, vídeos e documentos
                </Text>
              </YStack>

              <XStack gap={12} ai="center">
                {/* Busca */}
                <XStack position="relative" ai="center">
                  <Icon
                    name="Search"
                    size={16}
                    color="$textMuted"
                    style={{ position: 'absolute', left: 12, top: 10, pointerEvents: 'none' }}
                  />
                  <Input
                    placeholder="Buscar por nome..."
                    w={280}
                    h={36}
                    br="$3"
                    borderColor="$border"
                    backgroundColor="$background"
                    paddingLeft={40}
                    fontSize="$3"
                    color="$text"
                    value={search}
                    onChangeText={setSearch}
                  />
                </XStack>

                {/* Botão Upload */}
                <Button
                  onPress={() => setShowUploadModal(true)}
                  px={16}
                  py={10}
                  ai="center"
                  gap={6}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Icon name="Upload" size={16} color="$white" />
                  <Text fontSize={14} color="$white" fontWeight="500">Upload</Text>
                </Button>
              </XStack>
            </XStack>
          </YStack>

          {/* Filtros e Ordenação */}
          <XStack gap={12} ai="center" flexWrap="wrap" mb={16}>
            <FilterBar
              filterOptions={[
                { value: 'all', label: 'Todos' },
                { value: 'image', label: 'Imagens' },
                { value: 'video', label: 'Vídeos' },
                { value: 'document', label: 'Documentos' },
              ]}
              filterValue={typeFilter}
              onFilterChange={setTypeFilter}
              sortOptions={[
                { value: 'recent', label: 'Mais recentes' },
                { value: 'oldest', label: 'Mais antigos' },
                { value: 'name-az', label: 'Nome A-Z' },
                { value: 'name-za', label: 'Nome Z-A' },
              ]}
              sortValue={sortBy}
              onSortChange={(value) => setSortBy(value as typeof sortBy)}
              resultCount={sortedMedia.length}
              resultLabel="mídias"
              filterLabel={filterLabel || undefined}
              onClearFilter={() => setTypeFilter('all')}
              showResultCount={false}
              removeBottomMargin
            />
          </XStack>

          {/* Content */}
          {loading ? (
            <YStack py={64} ai="center" jc="center" gap={12} opacity={0.7}>
              <Spinner size="large" color="$primary" />
              <Text color="$textMuted" fontSize={14}>Carregando mídias…</Text>
            </YStack>
          ) : sortedMedia.length === 0 ? (
            <YStack ai="center" jc="center" py={64} gap={8} borderWidth={1} borderColor="$border" borderRadius={12} borderStyle="dashed" bg="$card">
              <Icon name="FolderOpen" size={48} color="$textMuted" />
              <Text color="$textMuted" fontSize={16} fontWeight="600">
                {search ? 'Nenhuma mídia encontrada' : 'Nenhuma mídia cadastrada'}
              </Text>
              <Text color="$textMuted" fontSize={14}>
                {search ? 'Ajuste a busca ou filtro.' : 'Clique em "Upload" para adicionar.'}
              </Text>
            </YStack>
          ) : (
            <YStack gap={12}>
              {sortedMedia.map((media) => (
                <Card
                  key={media.id}
                  p={0}
                  br="$4"
                  cursor="pointer"
                  interactive
                  borderWidth={1}
                  borderColor="$border"
                  pressStyle={{ opacity: 0.9 }}
                  onPress={() => setPreviewFile(media)}
                >
                  <XStack ai="center" p={20} gap={16}>
                    {/* Icon/Preview */}
                    <YStack
                      width={56}
                      height={56}
                      borderRadius={8}
                      bg="$background"
                      ai="center"
                      jc="center"
                      flexShrink={0}
                      overflow="hidden"
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={media.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        <Icon name={getFileIcon(media.type) as any} size={24} color="$textMuted" />
                      )}
                    </YStack>

                    {/* Info */}
                    <YStack flex={1} gap={4}>
                      <Text fontFamily="$display" fontSize={16} fontWeight="$6" numberOfLines={1}>
                        {media.name}
                      </Text>
                      <Text fontSize={13} color="$textMuted">
                        {media.mime_type} • {formatFileSize(media.size_bytes)}
                      </Text>
                    </YStack>

                    {/* Date */}
                    <YStack ai="flex-end" mr={16}>
                      <Text fontSize={13} color="$textMuted">
                        {new Date(media.created_at).toLocaleDateString('pt-BR')}
                      </Text>
                    </YStack>

                    {/* Actions */}
                    <XStack gap={8}>
                      <XStack
                        p={8}
                        borderRadius={8}
                        cursor="pointer"
                        hoverStyle={{ backgroundColor: '$secondary' }}
                        onPress={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(media.url);
                          alert('URL copiada!');
                        }}
                      >
                        <Icon name="Copy" size={16} color="$textMuted" />
                      </XStack>
                      <XStack
                        p={8}
                        borderRadius={8}
                        cursor="pointer"
                        hoverStyle={{ backgroundColor: '$secondary' }}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(media.id);
                        }}
                      >
                        <Icon name="Trash2" size={16} color="$danger" />
                      </XStack>
                    </XStack>
                  </XStack>
                </Card>
              ))}
            </YStack>
          )}
        </main>

        {/* Upload Modal */}
        {showUploadModal && (
          <XStack
            position="fixed"
            inset={0}
            ai="center"
            jc="center"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }}
          >
            <YStack bg="$card" br="$4" p={32} width={480} gap={20} borderWidth={1} borderColor="$border">
              <XStack ai="center" jc="space-between">
                <Text fontFamily="$display" fontSize={20} fontWeight="$6">Upload de Mídia</Text>
                <XStack
                  onPress={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  cursor="pointer"
                  p={4}
                >
                  <Icon name="X" size={20} color="$textMuted" />
                </XStack>
              </XStack>

              <YStack
                borderWidth={2}
                borderColor="$border"
                borderStyle="dashed"
                borderRadius={8}
                p={32}
                ai="center"
                onPress={() => fileInputRef.current?.click()}
                hoverStyle={{ borderColor: '$primary' }}
              >
                <Icon name="Upload" size={48} color="$textMuted" />
                <Text color="$textMuted" mt={16} fontSize={14}>
                  Clique para selecionar um arquivo
                </Text>
                <Text color="$textMuted" mt={8} fontSize={13}>
                  Imagens, vídeos ou documentos (máx. 100MB)
                </Text>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,application/pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </YStack>

              {selectedFile && (
                <YStack
                  borderWidth={1}
                  borderColor="$border"
                  borderRadius={8}
                  p={12}
                >
                  <XStack ai="center" gap={12}>
                    <Icon name={getFileIcon(selectedFile.type.startsWith('image/') ? 'image' : selectedFile.type.startsWith('video/') ? 'video' : 'document') as any} size={20} color="$primary" />
                    <YStack flex={1}>
                      <Text fontSize={13} fontWeight="600" numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text fontSize={12} color="$textMuted">
                        {formatFileSize(selectedFile.size)}
                      </Text>
                    </YStack>
                    <XStack
                      p={4}
                      borderRadius={4}
                      cursor="pointer"
                      hoverStyle={{ backgroundColor: '$secondary' }}
                      onPress={() => setSelectedFile(null)}
                    >
                      <Icon name="X" size={16} color="$textMuted" />
                    </XStack>
                  </XStack>
                </YStack>
              )}

              {uploading && (
                <YStack gap={8}>
                  <Text fontSize={13} color="$textMuted">Enviando...</Text>
                  <YStack height={4} bg="$border" borderRadius={2} overflow="hidden">
                    <YStack
                      height={4}
                      bg={BRAND_GRADIENT}
                      width={`${uploadProgress}%`}
                    />
                  </YStack>
                </YStack>
              )}

              <XStack gap={12} jc="flex-end" mt={8}>
                <Button
                  variant="ghost"
                  onPress={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  px={16}
                  py={10}
                >
                  <Text fontSize={14}>Cancelar</Text>
                </Button>
                <Button
                  onPress={handleUpload}
                  disabled={!selectedFile || uploading}
                  px={16}
                  py={10}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <XStack ai="center" gap={6}>
                    {uploading ? (
                      <Spinner size="small" color="$white" />
                    ) : (
                      <Icon name="Upload" size={14} color="$white" />
                    )}
                    <Text fontSize={14} color="$white" fontWeight="500">Enviar</Text>
                  </XStack>
                </Button>
              </XStack>
            </YStack>
          </XStack>
        )}

        {/* Preview Modal */}
        {previewFile && (
          <XStack
            position="fixed"
            inset={0}
            ai="center"
            jc="center"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000 }}
            onPress={() => setPreviewFile(null)}
          >
            <YStack
              bg="$card"
              br="$4"
              p={32}
              width={640}
              gap={20}
              borderWidth={1}
              borderColor="$border"
              onPress={(e) => e.stopPropagation()}
            >
              <XStack ai="center" jc="space-between">
                <Text fontFamily="$display" fontSize={20} fontWeight="$6" numberOfLines={1} flex={1}>
                  {previewFile.name}
                </Text>
                <XStack
                  p={4}
                  borderRadius={4}
                  cursor="pointer"
                  hoverStyle={{ backgroundColor: '$secondary' }}
                  onPress={() => setPreviewFile(null)}
                >
                  <Icon name="X" size={20} color="$textMuted" />
                </XStack>
              </XStack>

              {/* Preview content */}
              {previewFile.type === 'image' && (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  style={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                    borderRadius: 8,
                  }}
                />
              )}

              {previewFile.type === 'video' && (
                <video
                  src={previewFile.url}
                  controls
                  style={{
                    width: '100%',
                    maxHeight: 400,
                    borderRadius: 8,
                  }}
                />
              )}

              {previewFile.type === 'document' && (
                <YStack ai="center" py={32}>
                  <Icon name="FileText" size={64} color="$textMuted" />
                  <Text color="$textMuted" mt={16} fontSize={14}>
                    Preview não disponível para este tipo de arquivo
                  </Text>
                </YStack>
              )}

              {/* Metadata */}
              <YStack gap={8} pt={16} borderTopWidth={1} borderColor="$border">
                <XStack jc="space-between">
                  <Text fontSize={13} color="$textMuted">Tipo:</Text>
                  <Text fontSize={13}>{previewFile.mime_type}</Text>
                </XStack>
                <XStack jc="space-between">
                  <Text fontSize={13} color="$textMuted">Tamanho:</Text>
                  <Text fontSize={13}>{formatFileSize(previewFile.size_bytes)}</Text>
                </XStack>
                <XStack jc="space-between">
                  <Text fontSize={13} color="$textMuted">Enviado em:</Text>
                  <Text fontSize={13}>
                    {new Date(previewFile.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </XStack>
              </YStack>

              {/* Actions */}
              <XStack gap={12} jc="flex-end" mt={8}>
                <Button
                  variant="ghost"
                  onPress={() => {
                    navigator.clipboard.writeText(previewFile.url);
                    alert('URL copiada!');
                  }}
                  px={16}
                  py={10}
                >
                  <XStack ai="center" gap={6}>
                    <Icon name="Copy" size={14} />
                    <Text fontSize={14}>Copiar URL</Text>
                  </XStack>
                </Button>
                <Button
                  onPress={() => handleDelete(previewFile.id)}
                  px={16}
                  py={10}
                  style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <XStack ai="center" gap={6}>
                    <Icon name="Trash2" size={14} color="$danger" />
                    <Text fontSize={14} color="$danger">Excluir</Text>
                  </XStack>
                </Button>
              </XStack>
            </YStack>
          </XStack>
        )}
      </YStack>
    </Theme>
  );
}
