// Mock for expo-av — web-safe stubs for video/audio native modules.
// Used via resolve.alias in vitest.config.ts to prevent requireNativeModule calls in jsdom.

import React from 'react';

export const ResizeMode = {
  CONTAIN: 'contain',
  COVER: 'cover',
  STRETCH: 'stretch',
};

export const Audio = {
  Sound: {
    create: async (_source: any) => ({
      playAsync: async () => {},
      pauseAsync: async () => {},
      stopAsync: async () => {},
      setPositionAsync: async (_ms: number) => {},
      getStatusAsync: async () => ({ isLoaded: true, isPlaying: false, positionMillis: 0, durationMillis: 0 }),
      unloadAsync: async () => {},
      setOnPlaybackStatusUpdate: (_cb: any) => {},
      setVolumeAsync: async (_vol: number) => {},
      setRateAsync: async (_rate: number, _shouldCorrectPitch: boolean) => {},
    }),
  },
  Recording: class Recording {
    async prepareToRecordAsync() {}
    async startAndRecordAsync() {}
    async stopAndUnloadAsync() {}
    async getStatusAndRecordingStatus() {
      return { isLoaded: true, canRecord: false, isRecording: false };
    }
    getURI() {
      return null;
    }
  },
  setIsEnabledAsync: async (_enabled: boolean) => {},
  setAudioModeAsync: async (_mode: any) => {},
};

type VideoProps = {
  ref?: React.Ref<any>;
  source?: { uri: string };
  rate?: number;
  volume?: number;
  isMuted?: boolean;
  resizeMode?: string;
  shouldPlay?: boolean;
  useNativeControls?: boolean;
  onLoad?: () => void;
  onPlaybackStatusUpdate?: (status: any) => void;
  style?: any;
};

export const Video = React.forwardRef<any, VideoProps>((props, ref) => {
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} style={{ ...props.style, backgroundColor: '#000' }}>
      <video
        src={props.source?.uri}
        controls={props.useNativeControls}
        style={{ width: '100%', height: '100%' }}
        onLoadedData={props.onLoad}
      />
    </div>
  );
});

Video.displayName = 'Video';

export default { Audio, Video, ResizeMode };
