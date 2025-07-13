import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';

export const selectVariants = cva(
  'uk-select uk-theme-zinc dark bg-studio-700 text-white border-studio-600',
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

const Select = React.forwardRef(
  ({ className, variant, error, children, ...props }, ref) => {
    return (
      <select
        className={clsx(selectVariants({ variant, error }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export default Select;
