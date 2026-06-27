'use client';

import { useEffect, useState } from 'react';

export function scrollFocusedIntoView(element: HTMLElement) {
  if (!window.matchMedia('(max-width: 768px)').matches) return;

  setTimeout(() => {
    element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
  }, 300);
}

function useIsMobileLayout() {
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

export function useKeyboardInset() {
  const isMobile = useIsMobileLayout();
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!isMobile) {
      setInset(0);
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    function updateInset() {
      const vv = window.visualViewport;
      if (!vv) return;
      const covered = window.innerHeight - vv.height - vv.offsetTop;
      setInset(Math.max(0, covered));
    }

    updateInset();
    viewport.addEventListener('resize', updateInset);
    viewport.addEventListener('scroll', updateInset);

    return () => {
      viewport.removeEventListener('resize', updateInset);
      viewport.removeEventListener('scroll', updateInset);
    };
  }, [isMobile]);

  return isMobile ? inset : 0;
}
