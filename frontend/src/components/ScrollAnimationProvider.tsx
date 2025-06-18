import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface ScrollAnimationContextType {
  registerElement: (element: HTMLElement, animation?: string, delay?: number) => void;
  unregisterElement: (element: HTMLElement) => void;
  isVisible: (element: HTMLElement) => boolean;
}

const ScrollAnimationContext = createContext<ScrollAnimationContextType | null>(null);

export const useScrollAnimation = () => {
  const context = useContext(ScrollAnimationContext);
  if (!context) {
    throw new Error('useScrollAnimation must be used within ScrollAnimationProvider');
  }
  return context;
};

interface ScrollAnimationProviderProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export const ScrollAnimationProvider: React.FC<ScrollAnimationProviderProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<HTMLElement, { animation: string; delay: number }>>(new Map());
  const [visibleElements, setVisibleElements] = useState<Set<HTMLElement>>(new Set());

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const elementData = elementsRef.current.get(element);

          if (entry.isIntersecting) {
            // Element is visible - only animate once
            if (!element.classList.contains('animate-in') && elementData) {
              // Apply animation with delay
              setTimeout(() => {
                applyAnimation(element, elementData.animation);
              }, elementData.delay);
            }
          }
          // Don't reset animation when element goes out of view - keep it visible
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin]);

  const applyAnimation = (element: HTMLElement, animation: string) => {
    // Remove any existing animation classes
    element.classList.remove(
      'animate-slide-up', 'animate-slide-down', 'animate-slide-left', 'animate-slide-right',
      'animate-zoom-in', 'animate-zoom-out', 'animate-fade', 'animate-flip-x', 'animate-flip-y'
    );

    // Apply new animation
    element.classList.add(`animate-${animation}`);
    element.style.opacity = '1';
    element.style.transform = 'translateY(0) scale(1)';

    // Add general animation class
    element.classList.add('animate-in');
  };

  const resetAnimation = (element: HTMLElement) => {
    // Reset to initial state
    element.classList.remove('animate-in');
    element.classList.remove(
      'animate-slide-up', 'animate-slide-down', 'animate-slide-left', 'animate-slide-right',
      'animate-zoom-in', 'animate-zoom-out', 'animate-fade', 'animate-flip-x', 'animate-flip-y'
    );
    element.style.opacity = '0';
    element.style.transform = 'translateY(50px) scale(0.95)';
  };

  const registerElement = (element: HTMLElement, animation: string = 'slide-up', delay: number = 0) => {
    if (!element) return;

    // Store element data
    elementsRef.current.set(element, { animation, delay });

    // Set initial state
    element.style.opacity = '0';
    element.style.transform = 'translateY(50px) scale(0.95)';
    element.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    // Start observing
    observerRef.current?.observe(element);
  };

  const unregisterElement = (element: HTMLElement) => {
    elementsRef.current.delete(element);
    observerRef.current?.unobserve(element);
    setVisibleElements(prev => {
      const newSet = new Set(prev);
      newSet.delete(element);
      return newSet;
    });
  };

  const isVisible = (element: HTMLElement) => {
    return visibleElements.has(element);
  };

  const contextValue: ScrollAnimationContextType = {
    registerElement,
    unregisterElement,
    isVisible
  };

  return (
    <ScrollAnimationContext.Provider value={contextValue}>
      {children}
    </ScrollAnimationContext.Provider>
  );
};

// Hook for easy element registration
export const useScrollAnimationElement = (
  animation: string = 'slide-up',
  delay: number = 0
) => {
  const elementRef = useRef<HTMLElement>(null);
  const { registerElement, unregisterElement } = useScrollAnimation();
  const registeredRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (element && !registeredRef.current) {
      registerElement(element, animation, delay);
      registeredRef.current = true;

      return () => {
        unregisterElement(element);
        registeredRef.current = false;
      };
    }
  }, [registerElement, unregisterElement, animation, delay]);

  return elementRef;
};

// Component wrapper for scroll animations
interface ScrollAnimatedProps {
  children: React.ReactNode;
  animation?: string;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const ScrollAnimated: React.FC<ScrollAnimatedProps> = ({
  children,
  animation = 'slide-up',
  delay = 0,
  className = '',
  as: Component = 'div'
}) => {
  const elementRef = useScrollAnimationElement(animation, delay);

  return (
    <Component ref={elementRef} className={className}>
      {children}
    </Component>
  );
};

export default ScrollAnimationProvider;
