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
} from '@projeto/ui';
import { FilterBar } from '@projeto/ui';
import { AdminHeader } from '../../components/AdminHeader';
import { MediaService, AuthService } from '@projeto/core';
import type { MediaFile } from '@projeto/types';

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
        if (!cancelled) setUserProfile(profile);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate size (100MB max)
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

  const BRAND_GRADIENT = `linear-gradient(135deg, ${color.cwGradientFrom}, ${color.cwGradientTo})`;

  return (
    <Theme name="cloudWhite">
      <YStack bg="$background" minHeight="100vh">
        <AdminHeader userProfile={userProfile} onLogout={handleLogout} />

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
          {/* Hero Header */}
          <XStack alignItems="center" justifyContent="space-between" mb="$6">
            <YStack>
              <Text
                fontSize="$8"
                fontWeight="700"
                color="$text"
                style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Biblioteca de Mídias
              </Text>
              <Text fontSize="$4" color="$textMuted" mt="$1">
                Gerencie imagens, vídeos e documentos
              </Text>
            </YStack>

            <Button
              onPress={() => setShowUploadModal(true)}
              style={{ background: BRAND_GRADIENT }}
            >
              <Icon name="Upload" size={16} color="$white" />
              <Text color="$white" ml="$2">Upload</Text>
            </Button>
          </XStack>

          {/* Search */}
          <XStack position="relative" ai="center" mb={16}>
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

          {/* Filters */}
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
            sortValue="recent"
            onSortChange={() => {}}
            resultCount={filteredMedia.length}
            resultLabel="mídias"
            showResultCount={false}
            removeBottomMargin
          />

          {/* Content */}
          {loading ? (
            <YStack alignItems="center" justifyContent="center" py="$10">
              <Spinner size="large" color="$primary" />
              <Text color="$textMuted" mt="$4">Carregando mídias...</Text>
            </YStack>
          ) : filteredMedia.length === 0 ? (
            <Card variant="outlined" py="$10" alignItems="center">
              <Icon name="FolderOpen" size={48} color="$textMuted" />
              <Text color="$textMuted" mt="$4" fontSize="$4">
                {search ? 'Nenhuma mídia encontrada' : 'Nenhuma mídia cadastrada'}
              </Text>
            </Card>
          ) : (
            <YStack gap="$3">
              {filteredMedia.map((media) => (
                <Card
                  key={media.id}
                  variant="elevated"
                  pressStyle={{ opacity: 0.9 }}
                  onPress={() => setPreviewFile(media)}
                >
                  <XStack alignItems="center" p="$4" gap="$4">
                    {/* Icon/Preview */}
                    <YStack
                      width={56}
                      height={56}
                      borderRadius={8}
                      bg="$background"
                      alignItems="center"
                      justifyContent="center"
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
                    <YStack flex={1} gap="$1">
                      <Text fontSize="$4" fontWeight="600" color="$text" numberOfLines={1}>
                        {media.name}
                      </Text>
                      <Text fontSize="$3" color="$textMuted">
                        {media.mime_type} • {formatFileSize(media.size_bytes)}
                      </Text>
                    </YStack>

                    {/* Date */}
                    <YStack alignItems="flex-end" mr="$4">
                      <Text fontSize="$3" color="$textMuted">
                        {new Date(media.created_at).toLocaleDateString('pt-BR')}
                      </Text>
                    </YStack>

                    {/* Actions */}
                    <XStack gap="$2">
                      <Button
                        size="small"
                        variant="ghost"
                        onPress={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(media.url);
                          alert('URL copiada!');
                        }}
                      >
                        <Icon name="Copy" size={16} color="$textMuted" />
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(media.id);
                        }}
                      >
                        <Icon name="Trash2" size={16} color="$danger" />
                      </Button>
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
            bg="rgba(0,0,0,0.5)"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Card variant="elevated" p="$6" width={480} mx="$4">
              <YStack gap="$4">
                <Text fontSize="$6" fontWeight="700" color="$text">
                  Upload de Mídia
                </Text>

                <YStack
                  borderWidth={2}
                  borderColor="$border"
                  borderStyle="dashed"
                  borderRadius={8}
                  p="$8"
                  alignItems="center"
                  onPress={() => fileInputRef.current?.click()}
                  hoverStyle={{ borderColor: '$primary' }}
                >
                  <Icon name="Upload" size={48} color="$textMuted" />
                  <Text color="$textMuted" mt="$4" fontSize="$4">
                    Clique para selecionar um arquivo
                  </Text>
                  <Text color="$textMuted" mt="$2" fontSize="$3">
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
                  <Card variant="outlined" p="$3">
                    <XStack alignItems="center" gap="$3">
                      <Icon name={getFileIcon(selectedFile.type.startsWith('image/') ? 'image' : selectedFile.type.startsWith('video/') ? 'video' : 'document') as any} size={20} color="$primary" />
                      <YStack flex={1}>
                        <Text fontSize="$3" fontWeight="600" color="$text" numberOfLines={1}>
                          {selectedFile.name}
                        </Text>
                        <Text fontSize="$2" color="$textMuted">
                          {formatFileSize(selectedFile.size)}
                        </Text>
                      </YStack>
                      <Button
                        size="small"
                        variant="ghost"
                        onPress={() => setSelectedFile(null)}
                      >
                        <Icon name="X" size={16} color="$textMuted" />
                      </Button>
                    </XStack>
                  </Card>
                )}

                {uploading && (
                  <YStack gap="$2">
                    <Text fontSize="$3" color="$textMuted">Enviando...</Text>
                    <YStack height={4} bg="$border" borderRadius={2} overflow="hidden">
                      <YStack
                        height={4}
                        bg={BRAND_GRADIENT}
                        width={`${uploadProgress}%`}
                      />
                    </YStack>
                  </YStack>
                )}

                <XStack gap="$3" mt="$4">
                  <Button
                    flex={1}
                    variant="secondary"
                    onPress={() => {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    flex={1}
                    onPress={handleUpload}
                    disabled={!selectedFile || uploading}
                    style={{ background: BRAND_GRADIENT }}
                  >
                    {uploading ? (
                      <Spinner size="small" color="$white" />
                    ) : (
                      <Text color="$white">Enviar</Text>
                    )}
                  </Button>
                </XStack>
              </YStack>
            </Card>
          </XStack>
        )}

        {/* Preview Modal */}
        {previewFile && (
          <XStack
            position="fixed"
            inset={0}
            bg="rgba(0,0,0,0.8)"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
            onPress={() => setPreviewFile(null)}
          >
            <Card
              variant="elevated"
              p="$6"
              width={640}
              mx="$4"
              onPress={(e) => e.stopPropagation()}
            >
              <YStack gap="$4">
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize="$5" fontWeight="700" color="$text" numberOfLines={1}>
                    {previewFile.name}
                  </Text>
                  <Button
                    size="small"
                    variant="ghost"
                    onPress={() => setPreviewFile(null)}
                  >
                    <Icon name="X" size={20} color="$textMuted" />
                  </Button>
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
                  <YStack alignItems="center" py="$8">
                    <Icon name="FileText" size={64} color="$textMuted" />
                    <Text color="$textMuted" mt="$4">
                      Preview não disponível para este tipo de arquivo
                    </Text>
                  </YStack>
                )}

                {/* Metadata */}
                <YStack gap="$2" pt="$4" borderTopWidth={1} borderColor="$border">
                  <XStack justifyContent="space-between">
                    <Text fontSize="$3" color="$textMuted">Tipo:</Text>
                    <Text fontSize="$3" color="$text">{previewFile.mime_type}</Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize="$3" color="$textMuted">Tamanho:</Text>
                    <Text fontSize="$3" color="$text">{formatFileSize(previewFile.size_bytes)}</Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize="$3" color="$textMuted">Enviado em:</Text>
                    <Text fontSize="$3" color="$text">
                      {new Date(previewFile.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                  </XStack>
                </YStack>

                {/* Actions */}
                <XStack gap="$3" mt="$4">
                  <Button
                    flex={1}
                    variant="secondary"
                    onPress={() => {
                      navigator.clipboard.writeText(previewFile.url);
                      alert('URL copiada!');
                    }}
                  >
                    <Icon name="Copy" size={16} />
                    <Text ml="$2">Copiar URL</Text>
                  </Button>
                  <Button
                    flex={1}
                    variant="secondary"
                    onPress={() => handleDelete(previewFile.id)}
                  >
                    <Icon name="Trash2" size={16} color="$danger" />
                    <Text ml="$2" color="$danger">Excluir</Text>
                  </Button>
                </XStack>
              </YStack>
            </Card>
          </XStack>
        )}
      </YStack>
    </Theme>
  );
}
