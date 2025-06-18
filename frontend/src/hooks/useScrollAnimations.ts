import { useEffect, useRef, useCallback } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  animationClass?: string;
  delay?: number;
}

export const useScrollAnimations = (options: ScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    animationClass = 'animate-in',
    delay = 0
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  // Animation variants
  const animationVariants = {
    'slide-up': {
      initial: { opacity: 0, transform: 'translateY(50px) scale(0.95)' },
      animate: { opacity: 1, transform: 'translateY(0) scale(1)' }
    },
    'slide-down': {
      initial: { opacity: 0, transform: 'translateY(-50px) scale(0.95)' },
      animate: { opacity: 1, transform: 'translateY(0) scale(1)' }
    },
    'slide-left': {
      initial: { opacity: 0, transform: 'translateX(-50px) scale(0.95)' },
      animate: { opacity: 1, transform: 'translateX(0) scale(1)' }
    },
    'slide-right': {
      initial: { opacity: 0, transform: 'translateX(50px) scale(0.95)' },
      animate: { opacity: 1, transform: 'translateX(0) scale(1)' }
    },
    'zoom-in': {
      initial: { opacity: 0, transform: 'scale(0.5)' },
      animate: { opacity: 1, transform: 'scale(1)' }
    },
    'zoom-out': {
      initial: { opacity: 0, transform: 'scale(1.2)' },
      animate: { opacity: 1, transform: 'scale(1)' }
    },
    'flip-x': {
      initial: { opacity: 0, transform: 'rotateX(-90deg)' },
      animate: { opacity: 1, transform: 'rotateX(0deg)' }
    },
    'flip-y': {
      initial: { opacity: 0, transform: 'rotateY(-90deg)' },
      animate: { opacity: 1, transform: 'rotateY(0deg)' }
    },
    'fade': {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    }
  };

  // Apply animation to element
  const applyAnimation = useCallback((element: Element, variant: string = 'slide-up', customDelay: number = 0) => {
    const htmlElement = element as HTMLElement;
    const animation = animationVariants[variant] || animationVariants['slide-up'];
    
    // Set initial state
    Object.assign(htmlElement.style, {
      opacity: '0',
      transform: animation.initial.transform || '',
      transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      transitionDelay: `${delay + customDelay}ms`
    });

    // Trigger animation after a small delay
    setTimeout(() => {
      Object.assign(htmlElement.style, {
        opacity: '1',
        transform: animation.animate.transform || ''
      });
    }, 50);
  }, [delay]);

  // Create intersection observer
  const createObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const variant = element.dataset.animation || 'slide-up';
            const customDelay = parseInt(element.dataset.delay || '0');
            
            applyAnimation(element, variant, customDelay);
            
            // Add animation class
            element.classList.add(animationClass);
            
            // Remove from observer if triggerOnce is true
            if (triggerOnce) {
              observerRef.current?.unobserve(element);
              elementsRef.current.delete(element);
            }
          } else if (!triggerOnce) {
            // Reset animation if not triggerOnce
            const element = entry.target as HTMLElement;
            element.classList.remove(animationClass);
            const variant = element.dataset.animation || 'slide-up';
            const animation = animationVariants[variant] || animationVariants['slide-up'];
            
            Object.assign(element.style, {
              opacity: '0',
              transform: animation.initial.transform || ''
            });
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    // Observe all registered elements
    elementsRef.current.forEach(element => {
      observerRef.current?.observe(element);
    });
  }, [threshold, rootMargin, triggerOnce, animationClass, applyAnimation]);

  // Register element for animation
  const registerElement = useCallback((element: Element | null, variant: string = 'slide-up', customDelay: number = 0) => {
    if (!element) return;

    const htmlElement = element as HTMLElement;
    htmlElement.dataset.animation = variant;
    htmlElement.dataset.delay = customDelay.toString();
    
    elementsRef.current.add(element);
    
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  // Register multiple elements
  const registerElements = useCallback((selector: string, variant: string = 'slide-up') => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
      registerElement(element, variant, index * 100);
    });
  }, [registerElement]);

  // Unregister element
  const unregisterElement = useCallback((element: Element) => {
    elementsRef.current.delete(element);
    observerRef.current?.unobserve(element);
  }, []);

  // Initialize observer
  useEffect(() => {
    createObserver();
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, [createObserver]);

  // Auto-register elements with data-animate attribute
  useEffect(() => {
    const autoRegisterElements = () => {
      const elements = document.querySelectorAll('[data-animate]');
      elements.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        const variant = htmlElement.dataset.animate || 'slide-up';
        const customDelay = parseInt(htmlElement.dataset.delay || '0') || index * 100;
        registerElement(element, variant, customDelay);
      });
    };

    // Register elements after a short delay to ensure DOM is ready
    const timer = setTimeout(autoRegisterElements, 100);
    
    return () => clearTimeout(timer);
  }, [registerElement]);

  // Parallax scroll effect
  const addParallaxEffect = useCallback((element: Element, speed: number = 0.5) => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const htmlElement = element as HTMLElement;
      const yPos = -(scrolled * speed);
      htmlElement.style.transform = `translateY(${yPos}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Stagger animation for multiple elements
  const staggerElements = useCallback((elements: NodeListOf<Element> | Element[], variant: string = 'slide-up', staggerDelay: number = 100) => {
    elements.forEach((element, index) => {
      registerElement(element, variant, index * staggerDelay);
    });
  }, [registerElement]);

  return {
    registerElement,
    registerElements,
    unregisterElement,
    staggerElements,
    addParallaxEffect,
    createObserver
  };
};

export default useScrollAnimations;
