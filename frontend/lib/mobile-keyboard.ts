'use client';

import { useEffect, useState } from 'react';

export function useIsMobileLayout() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);

    function handleChange(event: MediaQueryListEvent) {
      setIsMobile(event.matches);
    }

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

export function scrollFocusedIntoView(element: HTMLElement) {
  if (!window.matchMedia('(max-width: 768px)').matches) return;

  const scroll = () => {
    element.scrollIntoView({ block: 'end', inline: 'nearest' });
  };

  scroll();
  setTimeout(scroll, 150);
  setTimeout(scroll, 400);
}

/** Distance from bottom of layout viewport to bottom of visible viewport (keyboard height). */
export function useVisualViewportBottom() {
  const isMobile = useIsMobileLayout();
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    if (!isMobile) {
      setBottomOffset(0);
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    function updateOffset() {
      const vv = window.visualViewport;
      if (!vv) return;
      setBottomOffset(Math.max(0, window.innerHeight - vv.offsetTop - vv.height));
    }

    updateOffset();
    viewport.addEventListener('resize', updateOffset);
    viewport.addEventListener('scroll', updateOffset);
    window.addEventListener('orientationchange', updateOffset);

    return () => {
      viewport.removeEventListener('resize', updateOffset);
      viewport.removeEventListener('scroll', updateOffset);
      window.removeEventListener('orientationchange', updateOffset);
    };
  }, [isMobile]);

  return { isMobile, bottomOffset };
}
