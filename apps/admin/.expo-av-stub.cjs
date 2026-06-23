// Web stub for `expo-av`. Used by Next.js/Turbopack to avoid resolving
// the full expo-av package (TypeScript + native deps → expo-modules-core).
// On web, the admin app only renders YouTube iframes (VideoBlock.tsx:42);
// the native <Video> component is never functional in a browser.

const React = require('react');

const Video = React.forwardRef(function VideoStub(props, ref) {
  const { source, style, resizeMode, shouldPlay, useNativeControls,
    onLoad, onPlaybackStatusUpdate, ...rest } = props;
  const uri = source && typeof source === 'object' ? source.uri : source;
  return React.createElement('video', {
    ref,
    src: uri || '',
    controls: useNativeControls !== false,
    style: { width: '100%', height: 'auto', ...style },
    ...rest,
  });
});
Video.displayName = 'VideoStub';

module.exports = {
  Video,
  ResizeMode: {
    CONTAIN: 'contain',
    COVER: 'cover',
    STRETCH: 'stretch',
  },
  Audio: {
    Sound: { createAsync: () => Promise.resolve({}) },
    setAudioModeAsync: () => Promise.resolve(),
  },
};
