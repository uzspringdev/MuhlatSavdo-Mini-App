import { useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Package, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { ImageDto } from '@/shared/types';
import { resolveImage } from '@/shared/utils';
import { useT } from '@/shared/i18n';

interface ProductGalleryProps {
  images: ImageDto[];
  alt: string;
  /** Browser-fallback back button — omit when Telegram's native BackButton already covers it */
  onBack?: () => void;
  /** Favorite/discount stack rendered inside the gallery's own positioning context */
  topRightSlot?: ReactNode;
}

const SWIPE_THRESHOLD = 40;

export function ProductGallery({ images, alt, onBack, topRightSlot }: ProductGalleryProps) {
  const t = useT();
  const [currentImg, setCurrentImg] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [failedIds, setFailedIds] = useState<Set<number>>(new Set());
  const touchStartX = useRef<number | null>(null);
  const lastTapRef = useRef(0);

  const goTo = (index: number) => setCurrentImg((index + images.length) % images.length);
  const goPrev = () => goTo(currentImg - 1);
  const goNext = () => goTo(currentImg + 1);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
  };

  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap inside fullscreen toggles zoom; outside, it just opens it.
      if (fullscreen) setZoomed((z) => !z);
    } else if (!fullscreen) {
      setFullscreen(true);
    }
    lastTapRef.current = now;
  };

  const closeFullscreen = () => {
    setFullscreen(false);
    setZoomed(false);
  };

  const currentImage = images[currentImg];
  const currentImageUrl = currentImage?.url || currentImage?.name;
  const currentImageFailed = currentImage ? failedIds.has(currentImage.id) : false;
  const markFailed = (id: number) => setFailedIds((prev) => new Set(prev).add(id));

  return (
    <>
      <div className="relative bg-neutral-50 dark:bg-neutral-900">
        <div
          className="aspect-square overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 0 && !currentImageFailed ? (
            <img
              src={resolveImage(currentImageUrl)}
              alt={alt}
              width={800}
              height={800}
              onClick={handleImageTap}
              onError={() => currentImage && markFailed(currentImage.id)}
              className="w-full h-full object-contain transition-opacity duration-300 cursor-zoom-in"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-20 h-20 text-neutral-300" />
            </div>
          )}
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 w-11 h-11 rounded-el bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center shadow-sm z-10"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          </button>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label={t('common.back')}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow z-10"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-800" />
            </button>
            <button
              onClick={goNext}
              aria-label={t('common.next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow z-10"
            >
              <ChevronRight className="w-4 h-4 text-neutral-800" />
            </button>

            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={t('common.imageN', { n: i + 1 })}
                  className="w-11 h-11 flex items-center justify-center flex-shrink-0"
                >
                  <span
                    className={clsx(
                      'block h-1.5 rounded-full transition-all',
                      i === currentImg ? 'w-4 bg-di-red' : 'w-1.5 bg-neutral-400/50',
                    )}
                  />
                </button>
              ))}
            </div>
          </>
        )}

        {topRightSlot && (
          <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">{topRightSlot}</div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-3 bg-white dark:bg-neutral-950">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => goTo(i)}
              aria-label={t('common.imageN', { n: i + 1 })}
              className={clsx(
                'flex-shrink-0 w-14 h-14 rounded-el overflow-hidden border-2 bg-neutral-50 dark:bg-neutral-900 transition-colors flex items-center justify-center',
                i === currentImg ? 'border-di-red' : 'border-transparent',
              )}
            >
              {failedIds.has(img.id) ? (
                <Package className="w-5 h-5 text-neutral-300" />
              ) : (
                <img
                  src={resolveImage(img.url || img.name)}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  onError={() => markFailed(img.id)}
                  className="w-full h-full object-contain"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen zoom viewer */}
      {fullscreen && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col" role="dialog" aria-modal="true">
          <button
            onClick={closeFullscreen}
            aria-label={t('common.close')}
            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className={clsx('flex-1', zoomed ? 'overflow-auto' : 'overflow-hidden flex items-center justify-center')}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {currentImageFailed ? (
              <Package className="w-20 h-20 text-neutral-500" />
            ) : (
              <img
                src={resolveImage(currentImageUrl)}
                alt={alt}
                onClick={handleImageTap}
                onError={() => currentImage && markFailed(currentImage.id)}
                className={clsx(
                  'transition-transform duration-200',
                  zoomed ? 'w-[200%] max-w-none cursor-zoom-out' : 'w-full h-full object-contain cursor-zoom-in',
                )}
              />
            )}
          </div>
          {images.length > 1 && !zoomed && (
            <div className="flex justify-center pb-6 pt-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={t('common.imageN', { n: i + 1 })}
                  className="w-11 h-11 flex items-center justify-center flex-shrink-0"
                >
                  <span
                    className={clsx(
                      'block h-1.5 rounded-full transition-all',
                      i === currentImg ? 'w-4 bg-white' : 'w-1.5 bg-white/40',
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
