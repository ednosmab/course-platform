import React, { useState } from 'react';
import { Platform, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { YStack, XStack, Text } from 'tamagui';
import { VideoBlock } from '@projeto/types';
import { Icon } from '../components/Icon';

type Props = {
  block: VideoBlock;
  onVideoProgress?: (progressSec: number, durationSec: number) => void;
  savedPosition?: number;
};

export const VideoBlockRenderer: React.FC<Props> = ({ block, onVideoProgress, savedPosition = 0 }) => {
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

  if (isYoutube && youtubeId && Platform.OS === 'web') {
    return (
      <YStack width="100%" bg="$gray1" borderRadius="$6" overflow="hidden" borderWidth={1} borderColor="$gray2" position="relative">
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
            backgroundColor: 'transparent',
          }}
        />
        <XStack ai="center" gap="$1.5" p="$3" borderTopWidth={1} borderTopColor="$gray2">
          <Icon name="BookOpen" size={12} color="$secondary" />
          <Text color="$gray5" fontSize={10} flex={1}>YouTube | {block.url}</Text>
        </XStack>
      </YStack>
    );
  }

  return (
    <YStack width="100%" bg="$gray1" borderRadius="$6" overflow="hidden" borderWidth={1} borderColor="$gray2" position="relative">
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
        style={{
          width: '100%',
          height: Dimensions.get('window').width * 0.56,
        }}
      />

      {!isPlaying && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          jc="center"
          ai="center"
          bg="rgba(0,0,0,0.4)"
          onPress={() => setIsPlaying(true)}
          pressStyle={{ opacity: 0.9 }}
        >
          <YStack
            width={60}
            height={60}
            borderRadius={30}
            bg="$primary"
            jc="center"
            ai="center"
          >
            <Icon name="Play" size={24} color="$white" style={{ marginLeft: 4 }} />
          </YStack>
        </YStack>
      )}

      <XStack ai="center" gap="$1.5" p="$3" borderTopWidth={1} borderTopColor="$gray2">
        <BookOpen size={12} color="$secondary" />
        <Text color="$gray5" fontSize={10} flex={1}>Source: {block.provider || 'Direct Video'} | {block.url}</Text>
      </XStack>
    </YStack>
  );
};
