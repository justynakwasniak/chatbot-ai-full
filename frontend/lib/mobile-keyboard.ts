'use client';

import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';

export function useIsMobileLayout() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    setIsMobile(media.matches);

    function handleChange(event: MediaQueryListEvent) {
      setIsMobile(event.matches);
    }

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

/** Tracks the visible viewport on mobile (shrinks when the keyboard opens). */
export function useMobileViewport() {
  const isMobile = useIsMobileLayout();
  const [layout, setLayout] = useState({ height: 0, offsetTop: 0 });

  useEffect(() => {
    if (!isMobile) return;

    const viewport = window.visualViewport;

    function update() {
      const vv = window.visualViewport;
      if (!vv) {
        setLayout({ height: window.innerHeight, offsetTop: 0 });
        return;
      }
      setLayout({
        height: vv.height,
        offsetTop: vv.offsetTop,
      });
    }

    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('orientationchange', update);

    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [isMobile]);

  return { isMobile, height: layout.height, offsetTop: layout.offsetTop };
}

export function scrollFocusedIntoView(element: HTMLElement) {
  if (!window.matchMedia(MOBILE_QUERY).matches) return;

  const scroll = () => {
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  scroll();
  setTimeout(scroll, 100);
  setTimeout(scroll, 300);
}
