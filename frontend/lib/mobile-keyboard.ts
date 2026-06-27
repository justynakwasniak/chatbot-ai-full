'use client';

import { useEffect, useState } from 'react';

export function scrollFocusedIntoView(element: HTMLElement) {
  setTimeout(() => {
    element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
  }, 300);
}

export function useKeyboardInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
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
  }, []);

  return inset;
}
