/**
 * Animates a small dot flying from the tapped "add to cart" button toward the
 * bottom nav's cart icon. Purely cosmetic feedback — imperative DOM, outside
 * React, because it targets a fixed screen position rather than any piece of
 * render state, and disappears on its own after the transition ends.
 */
export function flyToCart(sourceEl: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const target = document.getElementById('cart-nav-icon');
  if (!target) return;

  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const dot = document.createElement('div');
  dot.style.position = 'fixed';
  dot.style.left = `${sourceRect.left + sourceRect.width / 2 - 8}px`;
  dot.style.top = `${sourceRect.top + sourceRect.height / 2 - 8}px`;
  dot.style.width = '16px';
  dot.style.height = '16px';
  dot.style.borderRadius = '9999px';
  dot.style.background = 'var(--color-di-red)';
  dot.style.zIndex = '9999';
  dot.style.pointerEvents = 'none';
  dot.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in';
  document.body.appendChild(dot);

  const dx = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
  const dy = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);

  requestAnimationFrame(() => {
    dot.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
    dot.style.opacity = '0.3';
  });

  setTimeout(() => dot.remove(), 550);
}
