import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { AnyBlock } from '@projeto/types';
import { HelpCircle, CheckCircle, AlertTriangle, BookOpen, Play } from 'lucide-react-native';

const renderSimpleMarkdownMobile = (text: string, baseStyle: any) => {
  if (!text) return null;

  const lines = text.split('\n');
  
  return lines.map((line, lineIdx) => {
    const trimmedLine = line.trim();
    const isQuote = trimmedLine.startsWith('>') || trimmedLine.startsWith('&gt;');
    const cleanContent = isQuote 
      ? (trimmedLine.startsWith('&gt;') ? trimmedLine.slice(4).trim() : trimmedLine.slice(1).trim()) 
      : line;

    const regex = /(\*\*\*.*?\*\*\*|___.*?___|\*\*\_.*?\_\*\*|\_\*\*.*?\*\*\_|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g;
    const parts = cleanContent.split(regex);

    const renderedParts = parts.map((part, partIdx) => {
      const key = `part-${lineIdx}-${partIdx}`;
      if (part.startsWith('***') && part.endsWith('***')) {
        return <Text key={key} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('___') && part.endsWith('___')) {
        return <Text key={key} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('**_') && part.endsWith('_**')) {
        return <Text key={key} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('_**') && part.endsWith('**_')) {
        return <Text key={key} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={key} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <Text key={key} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <Text key={key} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</Text>;
      }
      if (part.startsWith('_') && part.endsWith('_')) {
        return <Text key={key} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</Text>;
      }
      return part;
    });

    if (isQuote) {
      return (
        <View key={lineIdx} style={{
          borderLeftColor: '#3b82f6',
          borderLeftWidth: 3,
          paddingLeft: 10,
          marginVertical: 6,
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          paddingVertical: 6,
          paddingRight: 8,
          borderRadius: 2,
        }}>
          <Text style={[baseStyle, { fontStyle: 'italic', color: '#4b5563' }]}>
            {renderedParts}
          </Text>
        </View>
      );
    }

    return (
      <Text key={lineIdx} style={baseStyle}>
        {renderedParts}
      </Text>
    );
  });
};

interface Layout {
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
}

const getLayout = (block: AnyBlock): Layout => {
  return block.layout || { x: 0, y: 0, w: 700, h: 150, zIndex: 0 };
};

function groupBlocksByRow(blocks: AnyBlock[]): AnyBlock[][] {
  if (!blocks.length) return [];
  const sorted = [...blocks].sort((a, b) => getLayout(a).y - getLayout(b).y);
  const rows: AnyBlock[][] = [];
  let row = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const bl = getLayout(sorted[i]);
    const overlaps = row.some(rb => {
      const rl = getLayout(rb);
      return bl.y < rl.y + rl.h && bl.y + bl.h > rl.y;
    });
    if (overlaps) {
      row.push(sorted[i]);
    } else {
      rows.push([...row].sort((a, b) => getLayout(a).x - getLayout(b).x));
      row = [sorted[i]];
    }
  }
  rows.push([...row].sort((a, b) => getLayout(a).x - getLayout(b).x));
  return rows;
}

interface BlockRendererProps {
  blocks: AnyBlock[];
  onVideoProgress?: (progressSec: number, durationSec: number) => void;
  savedPosition?: number;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks, onVideoProgress, savedPosition = 0 }) => {
  const rows = groupBlocksByRow(blocks);

  return (
    <View style={styles.container}>
      {rows.map((row, ri) => {
        const totalW = row.reduce((s, b) => s + getLayout(b).w, 0);
        return (
          <View key={`row-${ri}`} style={styles.row}>
            {row.map((block) => {
              const l = getLayout(block);
              const flexBasis = `${Math.max(40, Math.round((l.w / totalW) * 100))}%`;

              return (
                <View 
                  key={block.id} 
                  style={{ 
                    flexGrow: 1, 
                    flexShrink: 1, 
                    flexBasis: flexBasis as any,
                    minWidth: 140,
                  }}
                >
                  {block.type === 'text' && <TextBlockRenderer block={block} />}
                  {block.type === 'video' && (
                    <VideoBlockRenderer
                      block={block}
                      onVideoProgress={onVideoProgress}
                      savedPosition={savedPosition}
                    />
                  )}
                  {block.type === 'quiz' && <QuizBlockRenderer block={block} />}
                  {block.type === 'quote' && <QuoteBlockRenderer block={block} />}
                  {block.type === 'image' && <ImageBlockRenderer block={block} />}
                  {block.type === 'html' && <HtmlBlockRenderer block={block} />}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const ImageBlockRenderer: React.FC<{ block: any }> = ({ block }) => {
  if (!block.url) return null;
  const align = block.styles?.align || 'center';
  const borderRadius = block.styles?.borderRadius ? parseInt(block.styles.borderRadius) : 8;

  return (
    <View style={{
      width: '100%',
      alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
      marginVertical: 12,
    }}>
      <Image
        source={{ uri: block.url }}
        accessibilityLabel={block.alt || 'Imagem'}
        style={{
          width: '100%',
          height: undefined,
          aspectRatio: 16 / 9,
          borderRadius,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const HtmlBlockRenderer: React.FC<{ block: any }> = ({ block }) => {
  const htmlContent = block.htmlContent || '';

  if (Platform.OS === 'web') {
    return (
      <View style={{ marginVertical: 12, width: '100%' }}>
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{ width: '100%', color: '#cbd5e1' }}
        />
      </View>
    );
  }

  const cleanText = htmlContent.replace(/<[^>]*>?/gm, '');
  return (
    <View style={{
      padding: 12,
      backgroundColor: '#1e293b',
      borderRadius: 8,
      marginVertical: 12,
      borderLeftColor: '#818cf8',
      borderLeftWidth: 3,
    }}>
      <Text style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 18 }}>
        {cleanText}
      </Text>
    </View>
  );
};

const QuoteBlockRenderer: React.FC<{ block: any }> = ({ block }) => {
  const fontSize =
    block.styles?.fontSize === 'small'
      ? 12
      : block.styles?.fontSize === 'large'
        ? 18
        : block.styles?.fontSize === 'xlarge'
          ? 24
          : 14;

  const textAlign = block.styles?.align || 'left';
  const color = block.styles?.color || '#4b5563'; // var(--text-secondary)
  const backgroundColor = block.styles?.backgroundColor || '#f9fafb';

  return (
    <View style={{
      backgroundColor,
      borderLeftColor: '#3b82f6',
      borderLeftWidth: 4,
      paddingLeft: 12,
      paddingVertical: 12,
      paddingRight: 12,
      marginVertical: 12,
      borderRadius: 4,
    }}>
      <Text style={{ fontSize, textAlign, color, fontStyle: 'italic', lineHeight: 20 }}>
        {block.content}
      </Text>
      {block.author ? (
        <Text style={{ fontSize: 11, textAlign, color: '#9ca3af', marginTop: 6, fontWeight: '500' }}>
          — {block.author}
        </Text>
      ) : null}
    </View>
  );
};

const TextBlockRenderer: React.FC<{ block: any }> = ({ block }) => {
  const fontSize =
    block.styles?.fontSize === 'small'
      ? 12
      : block.styles?.fontSize === 'large'
        ? 18
        : block.styles?.fontSize === 'xlarge'
          ? 24
          : 14;

  const textAlign = block.styles?.align || 'left';

  return (
    <View style={styles.textContainer}>
      {renderSimpleMarkdownMobile(block.content, [styles.textBlock, { fontSize, textAlign }])}
    </View>
  );
};

const VideoBlockRenderer: React.FC<{
  block: any;
  onVideoProgress?: (progressSec: number, durationSec: number) => void;
  savedPosition: number;
}> = ({ block, onVideoProgress, savedPosition }) => {
  const videoRef = React.useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId(block.url);
  const isYoutube = !!youtubeId || block.provider === 'youtube';

  const handleLoad = async () => {
    if (savedPosition > 0 && videoRef.current) {
      console.log(`Auto-Resume: Buscando posição salva no segundo ${savedPosition}...`);
      await videoRef.current.setPositionAsync(savedPosition * 1000);
    }
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && status.durationMillis && onVideoProgress) {
      const progressSec = Math.floor(status.positionMillis / 1000);
      const durationSec = Math.floor(status.durationMillis / 1000);
      onVideoProgress(progressSec, durationSec);
    }
  };

  // Se for YouTube e estivermos na plataforma Web, renderizamos o iframe do YouTube de forma responsiva
  if (isYoutube && youtubeId && Platform.OS === 'web') {
    return (
      <View style={styles.videoContainer}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            width: '100%',
            height: 'auto',
            aspectRatio: '16/9',
            border: 'none',
            backgroundColor: '#000000',
          }}
        />
        <View style={styles.videoMeta}>
          <BookOpen size={12} color="#a78bfa" />
          <Text style={styles.videoMetaText}>Origem: YouTube | {block.url}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        source={{ uri: block.url || 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={isPlaying}
        useNativeControls
        onLoad={handleLoad}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        style={styles.videoPlayer}
      />
      
      {!isPlaying && (
        <TouchableOpacity style={styles.playButtonOverlay} onPress={() => setIsPlaying(true)}>
          <View style={styles.playIconContainer}>
            <Play size={24} color="#ffffff" style={styles.playIcon} />
          </View>
        </TouchableOpacity>
      )}
      
      <View style={styles.videoMeta}>
        <BookOpen size={12} color="#a78bfa" />
        <Text style={styles.videoMetaText}>Origem: {block.provider || 'Vídeo Direto'} | {block.url}</Text>
      </View>
    </View>
  );
};

const QuizBlockRenderer: React.FC<{ block: any }> = ({ block }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const activeOption = block.options.find((o: any) => o.id === selectedOptionId);

  const fontSize =
    block.styles?.fontSize === 'small'
      ? 12
      : block.styles?.fontSize === 'large'
        ? 18
        : block.styles?.fontSize === 'xlarge'
          ? 24
          : 14;

  const textAlign = block.styles?.align || 'left';

  const handleSubmit = () => {
    if (selectedOptionId) {
      setSubmitted(true);
    }
  };

  return (
    <View style={styles.quizCard}>
      <View style={styles.quizHeader}>
        <HelpCircle size={18} color="#ec4899" style={{ marginTop: 2 }} />
        <View style={{ flex: 1, marginLeft: 8 }}>
          {renderSimpleMarkdownMobile(block.question, [styles.quizQuestion, { fontSize, textAlign, flexWrap: 'wrap' }])}
        </View>
      </View>

      <View style={styles.quizOptionsList}>
        {block.options.map((opt: any) => {
          const isSelected = opt.id === selectedOptionId;
          const isCorrectAnswerSelected = activeOption?.isCorrect;
          const showCorrectStyle = submitted && opt.isCorrect && isCorrectAnswerSelected;
          const showIncorrectStyle = submitted && isSelected && !opt.isCorrect;

          return (
            <TouchableOpacity
              key={opt.id}
              disabled={submitted}
              onPress={() => setSelectedOptionId(opt.id)}
              style={[
                styles.optionButton,
                isSelected && styles.optionSelected,
                showCorrectStyle && styles.optionCorrect,
                showIncorrectStyle && styles.optionIncorrect,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                  showCorrectStyle && styles.optionTextCorrect,
                  showIncorrectStyle && styles.optionTextIncorrect,
                ]}
              >
                {opt.text}
              </Text>

              {showCorrectStyle && <CheckCircle size={16} color="#818cf8" />}
              {showIncorrectStyle && <AlertTriangle size={16} color="#ec4899" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {!submitted ? (
        <TouchableOpacity
          disabled={!selectedOptionId}
          onPress={handleSubmit}
          style={[styles.submitButton, !selectedOptionId && styles.submitButtonDisabled]}
        >
          <Text style={styles.submitButtonText}>Confirmar Resposta</Text>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            styles.feedbackCard,
            activeOption?.isCorrect ? styles.feedbackCardCorrect : styles.feedbackCardIncorrect,
          ]}
        >
          <Text style={styles.feedbackTitle}>
            {activeOption?.isCorrect ? '✅ Resposta Correta!' : '❌ Ops! Resposta Incorreta.'}
          </Text>
          <Text style={styles.feedbackText}>{activeOption?.feedback}</Text>
          
          <TouchableOpacity
            onPress={() => {
              setSubmitted(false);
              setSelectedOptionId(null);
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-start',
    width: '100%',
  },
  textContainer: {
    paddingHorizontal: 8,
  },
  textBlock: {
    color: '#1e293b',
    lineHeight: 22,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: Dimensions.get('window').width * 0.56,
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  playIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    marginLeft: 4,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  videoMetaText: {
    color: '#64748b',
    fontSize: 10,
    flex: 1,
  },
  quizCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 14,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quizQuestion: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  quizOptionsList: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
  },
  optionSelected: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
  },
  optionCorrect: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  optionIncorrect: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  optionText: {
    color: '#334155',
    fontSize: 12,
  },
  optionTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#10b981',
    fontWeight: '600',
  },
  optionTextIncorrect: {
    color: '#ec4899',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#1e293b',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackCard: {
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginTop: 4,
  },
  feedbackCardCorrect: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  feedbackCardIncorrect: {
    backgroundColor: 'rgba(236, 72, 153, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  feedbackTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  feedbackText: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  retryButtonText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '600',
  },
});
