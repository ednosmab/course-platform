import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { AnyBlock } from '@projeto/types';
import { HelpCircle, CheckCircle, AlertTriangle, BookOpen, Play } from 'lucide-react-native';

interface BlockRendererProps {
  blocks: AnyBlock[];
  onVideoProgress?: (progressSec: number, durationSec: number) => void;
  savedPosition?: number;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks, onVideoProgress, savedPosition = 0 }) => {
  return (
    <View style={styles.container}>
      {blocks.map((block) => {
        if (block.type === 'text') {
          return <TextBlockRenderer key={block.id} block={block} />;
        }
        if (block.type === 'video') {
          return (
            <VideoBlockRenderer
              key={block.id}
              block={block}
              onVideoProgress={onVideoProgress}
              savedPosition={savedPosition}
            />
          );
        }
        if (block.type === 'quiz') {
          return <QuizBlockRenderer key={block.id} block={block} />;
        }
        return null;
      })}
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
      <Text style={[styles.textBlock, { fontSize, textAlign }]}>
        {block.content}
      </Text>
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
        <HelpCircle size={18} color="#ec4899" />
        <Text style={[styles.quizQuestion, { fontSize, textAlign }]}>{block.question}</Text>
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
  textContainer: {
    paddingHorizontal: 8,
  },
  textBlock: {
    color: '#cbd5e1',
    lineHeight: 22,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    borderTopColor: '#1e293b',
  },
  videoMetaText: {
    color: '#64748b',
    fontSize: 10,
    flex: 1,
  },
  quizCard: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    gap: 14,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quizQuestion: {
    color: '#f1f5f9',
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
    backgroundColor: '#030712',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
  },
  optionSelected: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  optionCorrect: {
    borderColor: '#818cf8',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  optionIncorrect: {
    borderColor: '#ec4899',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },
  optionText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  optionTextSelected: {
    color: '#cbd5e1',
  },
  optionTextCorrect: {
    color: '#818cf8',
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
