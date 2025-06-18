import { useEffect, useRef, useCallback } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useSimpleScrollAnimation = (options: ScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const animatedElementsRef = useRef<Set<Element>>(new Set());

  // Initialize observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          
          if (entry.isIntersecting && !animatedElementsRef.current.has(element)) {
            // Element is visible and hasn't been animated yet
            const animationType = element.dataset.animation || 'slide-up';
            const delay = parseInt(element.dataset.delay || '0');
            
            // Apply animation after delay
            setTimeout(() => {
              applyAnimation(element, animationType);
              
              // Mark as animated
              animatedElementsRef.current.add(element);
              
              // Stop observing if triggerOnce is true
              if (triggerOnce) {
                observerRef.current?.unobserve(element);
              }
            }, delay);
          }
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
  }, [threshold, rootMargin, triggerOnce]);

  // Apply animation styles
  const applyAnimation = (element: HTMLElement, animationType: string) => {
    // Set final state
    element.style.opacity = '1';
    element.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
    element.style.filter = 'blur(0px)';
    
    // Add animation class
    element.classList.add('animate-in');
    
    // Add specific animation class
    switch (animationType) {
      case 'slide-up':
        element.classList.add('animate-slide-up');
        break;
      case 'slide-down':
        element.classList.add('animate-slide-down');
        break;
      case 'slide-left':
        element.classList.add('animate-slide-left');
        break;
      case 'slide-right':
        element.classList.add('animate-slide-right');
        break;
      case 'zoom-in':
        element.classList.add('animate-zoom-in');
        break;
      case 'zoom-out':
        element.classList.add('animate-zoom-out');
        break;
      case 'fade':
        element.classList.add('animate-fade');
        break;
      case 'flip-x':
        element.classList.add('animate-flip-x');
        break;
      case 'flip-y':
        element.classList.add('animate-flip-y');
        break;
      default:
        element.classList.add('animate-slide-up');
    }
  };

  // Register element for animation
  const registerElement = useCallback((element: Element | null, animationType: string = 'slide-up', delay: number = 0) => {
    if (!element || !observerRef.current) return;

    const htmlElement = element as HTMLElement;
    
    // Set data attributes
    htmlElement.dataset.animation = animationType;
    htmlElement.dataset.delay = delay.toString();
    
    // Set initial state
    htmlElement.style.opacity = '0';
    htmlElement.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    // Set initial transform based on animation type
    switch (animationType) {
      case 'slide-up':
        htmlElement.style.transform = 'translateY(50px) scale(0.95)';
        break;
      case 'slide-down':
        htmlElement.style.transform = 'translateY(-50px) scale(0.95)';
        break;
      case 'slide-left':
        htmlElement.style.transform = 'translateX(-50px) scale(0.95)';
        break;
      case 'slide-right':
        htmlElement.style.transform = 'translateX(50px) scale(0.95)';
        break;
      case 'zoom-in':
        htmlElement.style.transform = 'scale(0.5)';
        break;
      case 'zoom-out':
        htmlElement.style.transform = 'scale(1.2)';
        break;
      case 'flip-x':
        htmlElement.style.transform = 'rotateX(-90deg)';
        break;
      case 'flip-y':
        htmlElement.style.transform = 'rotateY(-90deg)';
        break;
      case 'fade':
        htmlElement.style.transform = 'scale(1)';
        break;
      default:
        htmlElement.style.transform = 'translateY(50px) scale(0.95)';
    }
    
    // Start observing
    observerRef.current.observe(element);
  }, []);

  // Auto-register elements with data-animate attribute
  const autoRegisterElements = useCallback(() => {
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const animationType = htmlElement.dataset.animate || 'slide-up';
      const delay = parseInt(htmlElement.dataset.delay || '0') || index * 100;
      registerElement(element, animationType, delay);
    });
  }, [registerElement]);

  // Register elements by selector
  const registerElementsBySelector = useCallback((selector: string, animationType: string = 'slide-up', staggerDelay: number = 100) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
      registerElement(element, animationType, index * staggerDelay);
    });
  }, [registerElement]);

  return {
    registerElement,
    registerElementsBySelector,
    autoRegisterElements
  };
};

export default useSimpleScrollAnimation;
