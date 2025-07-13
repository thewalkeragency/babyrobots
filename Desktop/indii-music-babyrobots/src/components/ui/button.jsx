import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';

export const buttonVariants = cva(
  'uk-button',
  {
    variants: {
      variant: {
        default: 'uk-button-default',
        primary: 'uk-button-primary',
        secondary: 'uk-button-secondary',
        danger: 'uk-button-danger',
        text: 'uk-button-text',
        link: 'uk-button-link',
      },
      size: {
        default: '',
        small: 'uk-button-small',
        large: 'uk-button-large',
      },
      disabled: {
        true: 'uk-disabled',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, disabled, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={clsx(buttonVariants({ variant, size, disabled: disabled || isLoading }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="uk-flex uk-flex-center uk-flex-middle">
            <div className="uk-spinner uk-margin-small-right"></div>
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
