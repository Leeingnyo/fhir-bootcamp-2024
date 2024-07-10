import { useCallback, useLayoutEffect, useRef, useState } from 'react';

function isElementInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight + 1) && rect.right <= window.innerWidth;
}

export const KeepMeInScreen = () => {
  const [isStick, setIsStick] = useState(false);

  const visibleRef = useRef<HTMLDivElement | null>(null);

  const handleVisibleRef = useCallback((visibleElement: HTMLDivElement | null) => {
    if (visibleElement) {
      setIsStick(isElementInViewport(visibleElement));
    }
    visibleRef.current = visibleElement;
  }, []);

  useLayoutEffect(() => {
    const visibleElement = visibleRef.current;
    if (!visibleElement) {
      return;
    }

    const handleScrollOrResize = () => {
      setIsStick(isElementInViewport(visibleElement));
    };

    window.addEventListener('scroll', handleScrollOrResize);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (isStick && visibleRef.current) {
      visibleRef.current.scrollIntoView();
    }
  });

  return (
    <div ref={handleVisibleRef} />
  );
}
