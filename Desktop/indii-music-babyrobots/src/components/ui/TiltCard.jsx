import React, { useEffect, useRef, forwardRef } from 'react';
import VanillaTilt from 'vanilla-tilt';
import { clsx } from 'clsx';

const TiltCard = forwardRef(({
  children,
  className,
  tiltOptions = {},
  disabled = false,
  ...props
}, ref) => {
  const tiltRef = useRef(null);

  const defaultOptions = {
    max: 15,
    speed: 400,
    glare: true,
    'max-glare': 0.3,
    perspective: 1000,
    scale: 1.02,
    transition: true,
    axis: null,
    reset: true,
    easing: "cubic-bezier(.03,.98,.52,.99)",
  };

  const options = { ...defaultOptions, ...tiltOptions };

  useEffect(() => {
    const element = tiltRef.current;
    
    if (element && !disabled) {
      VanillaTilt.init(element, options);
      
      return () => {
        if (element && element.vanillaTilt) {
          element.vanillaTilt.destroy();
        }
      };
    }
  }, [disabled, options]);

  return (
    <div
      ref={(node) => {
        tiltRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={clsx(
        'transform-gpu', // Enable GPU acceleration
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

TiltCard.displayName = 'TiltCard';

export default TiltCard;
