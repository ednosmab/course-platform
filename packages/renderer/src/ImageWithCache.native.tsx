import React from 'react';
import { Image, Text, YStack } from 'react-native';

interface ImageWithCacheProps {
  src: string;
  alt?: string;
  style?: Record<string, unknown>;
  resolveUrl?: (url: string) => Promise<string>;
}

interface ImageWithCacheState {
  resolvedSrc: string;
  loading: boolean;
}

/**
 * Native image component with optional offline cache support.
 * Uses react-native Image instead of HTML <img>.
 */
export class ImageWithCache extends React.Component<ImageWithCacheProps, ImageWithCacheState> {
  constructor(props: ImageWithCacheProps) {
    super(props);
    this.state = {
      resolvedSrc: props.src,
      loading: !!props.resolveUrl,
    };
  }

  async componentDidMount() {
    if (this.props.resolveUrl) {
      try {
        const resolved = await this.props.resolveUrl(this.props.src);
        if (resolved && this.mounted) {
          this.setState({ resolvedSrc: resolved, loading: false });
        } else if (this.mounted) {
          this.setState({ loading: false });
        }
      } catch {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      }
    }
  }

  private mounted = true;

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { alt, style } = this.props;
    const { resolvedSrc, loading } = this.state;

    if (loading) {
      return (
        <YStack
          flex={1}
          backgroundColor="#f3f4f6"
          alignItems="center"
          justifyContent="center"
        >
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>Loading...</Text>
        </YStack>
      );
    }

    return (
      <Image
        source={{ uri: resolvedSrc }}
        accessibilityLabel={alt || ''}
        style={style as any}
        resizeMode="cover"
      />
    );
  }
}
