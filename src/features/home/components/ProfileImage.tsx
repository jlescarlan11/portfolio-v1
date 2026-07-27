'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import Image from 'next/image';

export type ProfileImageOutcome = 'loaded' | 'fallback';

interface ProfileImageProps {
  src: string;
  alt: string;
  className?: string;
  onSettled?: (outcome: ProfileImageOutcome) => void;
}

export default function ProfileImage({
  src,
  alt,
  className = '',
  onSettled
}: ProfileImageProps): React.JSX.Element {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const mountedRef = useRef(false);
  const settledRef = useRef(false);
  const decodePendingRef = useRef(false);
  const sourceVersionRef = useRef(0);
  const onSettledRef = useRef(onSettled);
  const [showFallback, setShowFallback] = useState(false);

  onSettledRef.current = onSettled;

  const settle = useCallback((outcome: ProfileImageOutcome): void => {
    if (!mountedRef.current || settledRef.current) {
      return;
    }

    settledRef.current = true;
    decodePendingRef.current = false;

    if (outcome === 'fallback') {
      setShowFallback(true);
    }

    onSettledRef.current?.(outcome);
  }, []);

  const verifyUsableImage = useCallback(
    (image: HTMLImageElement): void => {
      if (
        !mountedRef.current ||
        settledRef.current ||
        decodePendingRef.current
      ) {
        return;
      }

      if (!image.complete) {
        return;
      }

      if (image.naturalWidth <= 0) {
        settle('fallback');
        return;
      }

      if (typeof image.decode !== 'function') {
        settle('loaded');
        return;
      }

      const sourceVersion = sourceVersionRef.current;
      decodePendingRef.current = true;
      void image.decode().then(
        () => {
          decodePendingRef.current = false;
          if (sourceVersionRef.current !== sourceVersion) {
            return;
          }
          settle(image.complete && image.naturalWidth > 0 ? 'loaded' : 'fallback');
        },
        () => {
          decodePendingRef.current = false;
          if (sourceVersionRef.current !== sourceVersion) {
            return;
          }
          settle(image.complete && image.naturalWidth > 0 ? 'loaded' : 'fallback');
        }
      );
    },
    [settle]
  );

  useEffect(() => {
    sourceVersionRef.current += 1;
    mountedRef.current = true;
    settledRef.current = false;
    decodePendingRef.current = false;
    setShowFallback(false);

    const image = imageRef.current;
    if (image?.complete) {
      verifyUsableImage(image);
    }

    return () => {
      mountedRef.current = false;
      decodePendingRef.current = false;
    };
  }, [src, verifyUsableImage]);

  return (
    <figure className={['flex justify-center', className].filter(Boolean).join(' ')}>
      <div className="h-full max-h-full w-full max-w-full shrink-0 cursor-default overflow-hidden bg-surface-muted transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1 hover:scale-[1.02]">
        {showFallback ? (
          <span
            role="img"
            aria-label={alt}
            className="block h-full w-full bg-surface-muted"
          />
        ) : (
          <Image
            ref={imageRef}
            src={src}
            alt={alt}
            width={300}
            height={300}
            className="block h-full w-full object-cover grayscale"
            priority
            onLoad={(event) => verifyUsableImage(event.currentTarget)}
            onError={() => settle('fallback')}
          />
        )}
      </div>
    </figure>
  );
}
