import React from 'react';

interface ImageWithCacheProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  resolveUrl?: (url: string) => Promise<string>;
}

interface ImageWithCacheState {
  resolvedSrc: string;
  loading: boolean;
}

/**
 * Image component with optional offline cache support.
 * When a resolveUrl function is provided, it resolves URLs to local cached paths.
 * Falls back to the original URL when resolveUrl is not provided or resolution fails.
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
        <div
          style={{
            ...style,
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Loading...</span>
        </div>
      );
    }

    return <img src={resolvedSrc} alt={alt || ''} style={style} />;
  }
}
