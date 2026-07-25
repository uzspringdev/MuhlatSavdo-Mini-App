import { useRef, useState } from 'react';

import { clsx } from 'clsx';
import type { CategoryDto } from '@/shared/types';
import { resolveImage } from '@/shared/utils';
import { telegram } from '@/app/telegram/telegram';

interface CategorySliderProps {
  categories: CategoryDto[];
  activeId?: number;
  onSelect?: (category: CategoryDto) => void;
}

export function CategorySlider({
  categories,
  activeId,
  onSelect,
}: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [failedIds, setFailedIds] = useState<Set<number>>(new Set());

  const handleClick = (cat: CategoryDto) => {
    telegram.haptic.selection();
    onSelect?.(cat);
  };

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto scroll-smooth py-3 px-5 -mx-4 hide-scrollbar"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        const iconUrl = cat.imageUrl || cat.iconUrl || cat.icon?.url || cat.icon?.name || cat.image?.url || cat.image?.name;

        return (
          <button
            key={cat.id}
            onClick={() => handleClick(cat)}
            className={clsx(
              'flex-shrink-0 flex flex-col items-center gap-2 scroll-snap-align-start transition-all duration-200 p-1',
            )}
            style={{ scrollSnapAlign: 'start' }}
          >
            <div
              className={clsx(
                'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200',
                isActive
                  ? 'ring-2 ring-inset ring-di-red bg-di-red/10 scale-105'
                  : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700',
              )}
            >
              {iconUrl && !failedIds.has(cat.id) ? (
                <img
                  src={resolveImage(iconUrl)}
                  alt={cat.name}
                  width={40}
                  height={40}
                  loading="lazy"
                  onError={() => setFailedIds((prev) => new Set(prev).add(cat.id))}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <span className="text-2xl">{cat.name.charAt(0)}</span>
              )}
            </div>
            <span
              className={clsx(
                'text-caption font-medium text-center leading-tight max-w-[64px] transition-colors',
                isActive
                  ? 'text-di-red font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400',
              )}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
