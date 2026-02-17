import { useState, useEffect } from 'react';

export function useIntersectionObserver(ref, root = null) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const div = ref.current;
    const rootElement = root?.current || null;
    
    // Validar que el elemento existe antes de observar
    if (!div) {
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsIntersecting(entry.isIntersecting);
      },
      {
        // Options (Optional)
        root: rootElement, // Use the provided root or default to viewport
        rootMargin: '0px',
        threshold: 0.5 // The observer will trigger when at least 50% of the target is visible
      }
    );
    
    observer.observe(div);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, root]);

  return isIntersecting;
}
