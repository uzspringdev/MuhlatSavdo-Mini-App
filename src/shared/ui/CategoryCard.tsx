import { useState } from 'react';
import { clsx } from 'clsx';
import type { CategoryDto } from '@/shared/types';
import { resolveImage } from '@/shared/utils';

interface CategoryCardProps {
  category: CategoryDto;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryCard({ category, isActive, onClick }: CategoryCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const imageUrl = category.imageUrl || category.iconUrl || category.image?.url || category.image?.name || category.icon?.url || category.icon?.name;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative overflow-hidden rounded-2xl p-2 transition-all duration-300 active:scale-95',
        isActive
          ? 'ring-2 ring-di-red shadow-lg shadow-di-red/20 bg-white dark:bg-neutral-800'
          : 'bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md',
      )}
    >
      {/* Inner framed image — a small gap from the card edge keeps busy photos
          from feeling zoomed-in/cropped-too-tight against the tile bounds */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
        {imageUrl && !imgFailed ? (
          <img
            src={resolveImage(imageUrl)}
            alt={category.name}
            width={300}
            height={300}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-active:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-700">
            <span className="text-4xl font-bold text-neutral-300 dark:text-neutral-600">
              {category.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Overlay for text legibility if image is busy */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-bold leading-tight line-clamp-2 text-white transition-colors">
            {category.name}
          </h3>
        </div>
      </div>
    </button>
  );
}
