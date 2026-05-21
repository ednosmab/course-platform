import React from 'react';

export const ResizeMode = {
  CONTAIN: 'contain',
  COVER: 'cover',
  STRETCH: 'stretch',
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
