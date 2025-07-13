import { clsx } from 'clsx';

export { default as Button } from './button';
export { default as Card } from './card';



// Badge Component
export const Badge = ({ 
  variant = 'default', 
  size = 'md',
  children, 
  className,
  ...props 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    artist: 'bg-artist/10 text-artist-dark dark:bg-artist/20 dark:text-artist-light',
    fan: 'bg-fan/10 text-fan-dark dark:bg-fan/20 dark:text-fan-light',
    licensor: 'bg-licensor/10 text-licensor-dark dark:bg-licensor/20 dark:text-licensor-light',
    provider: 'bg-provider/10 text-provider-dark dark:bg-provider/20 dark:text-provider-light',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const classes = clsx(
    'inline-flex items-center font-medium rounded-full',
    variants[variant],
    sizes[size],
    className
  );

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

// Loading Skeleton Component
export const Skeleton = ({ 
  className,
  ...props 
}) => {
  return (
    <div 
      className={clsx('loading-skeleton', className)} 
      {...props} 
    />
  );
};

// Avatar Component
export const Avatar = ({ 
  src,
  alt,
  size = 'md',
  fallback,
  className,
  ...props 
}) => {
  const sizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-20 w-20',
  };

  const classes = clsx(
    'inline-block rounded-full bg-gray-100 dark:bg-gray-800',
    sizes[size],
    className
  );

  if (src) {
    return (
      <img
        className={classes}
        src={src}
        alt={alt}
        {...props}
      />
    );
  }

  return (
    <div className={clsx(classes, 'flex items-center justify-center text-gray-500 dark:text-gray-400')}>
      {fallback || (
        <svg className="h-2/3 w-2/3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </div>
  );
};

// Divider Component
export const Divider = ({ 
  orientation = 'horizontal',
  className,
  ...props 
}) => {
  const classes = clsx(
    'border-gray-200 dark:border-gray-700',
    orientation === 'horizontal' ? 'border-t w-full' : 'border-l h-full',
    className
  );

  return <div className={classes} {...props} />;
};

// Modal/Dialog Component
export const Modal = ({ 
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={clsx(
          'inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:align-middle',
          sizes[size],
          className
        )}>
          {title && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
          )}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tooltip Component
export const Tooltip = ({ 
  children,
  content,
  position = 'top',
  className,
}) => {
  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group">
      {children}
      <div className={clsx(
        'absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        'px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm dark:bg-gray-700',
        'pointer-events-none whitespace-nowrap',
        positions[position],
        className
      )}>
        {content}
      </div>
    </div>
  );
};

// Progress Component
export const Progress = ({ 
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variants = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-gray-700 dark:text-gray-300">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={clsx(
        'w-full bg-gray-200 rounded-full dark:bg-gray-700',
        sizes[size],
        className
      )}>
        <div 
          className={clsx(
            'h-full rounded-full transition-all duration-300',
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Enhanced Layout Components
export const Container = ({ 
  children,
  size = 'default',
  className,
  ...props 
}) => {
  const sizes = {
    sm: 'max-w-3xl',
    default: 'max-w-7xl',
    lg: 'max-w-full',
  };

  return (
    <div 
      className={clsx(
        'mx-auto px-4 sm:px-6 lg:px-8',
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Grid = ({ 
  children,
  cols = 1,
  gap = 6,
  className,
  ...props 
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div 
      className={clsx(
        'grid',
        colClasses[cols],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { default as Input } from './input';
export { default as Select } from './select';
