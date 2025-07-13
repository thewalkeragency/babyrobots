import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';

export const inputVariants = cva(
  'uk-input uk-theme-zinc dark bg-studio-700 text-white border-studio-600',
  {
    variants: {
      variant: {
        default: 'uk-form-width-medium',
        small: 'uk-form-width-small',
        large: 'uk-form-width-large',
        full: 'uk-width-1-1',
      },
      error: {
        true: 'uk-form-danger',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Input = React.forwardRef(
  ({ className, variant, error, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={clsx(inputVariants({ variant, error }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
