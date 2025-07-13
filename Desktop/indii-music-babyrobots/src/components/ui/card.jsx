import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';

export const cardVariants = cva(
  'uk-card uk-card-default uk-theme-zinc dark',
  {
    variants: {
      variant: {
        default: 'uk-card-body',
        primary: 'uk-card-primary',
        secondary: 'uk-card-secondary',
        hover: 'uk-card-hover',
      },
      size: {
        default: '',
        small: 'uk-card-small',
        large: 'uk-card-large',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Card = React.forwardRef(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        className={clsx(cardVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
