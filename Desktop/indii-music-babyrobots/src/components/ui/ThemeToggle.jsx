import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';

export const ThemeToggle = ({ 
  variant = 'button',
  className,
  ...props 
}) => {
  const { theme, toggleTheme, isDark, mounted } = useTheme();

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={clsx('h-5 w-5', className)} {...props}>
        {/* Placeholder during SSR */}
      </div>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={clsx('flex items-center space-x-3', className)} {...props}>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Light
        </span>
        <button
          onClick={toggleTheme}
          className={clsx(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            isDark ? 'bg-primary-600' : 'bg-gray-200'
          )}
          role="switch"
          aria-checked={isDark}
          aria-label="Toggle dark mode"
        >
          <span
            className={clsx(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              isDark ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Dark
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'relative p-2 rounded-lg transition-all duration-200',
        'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        className
      )}
      aria-label="Toggle theme"
      {...props}
    >
      <div className="relative h-5 w-5">
        {/* Sun Icon */}
        <svg
          className={clsx(
            'absolute inset-0 h-5 w-5 transition-all duration-300',
            isDark 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* Moon Icon */}
        <svg
          className={clsx(
            'absolute inset-0 h-5 w-5 transition-all duration-300',
            isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>
    </button>
  );
};

export const ThemeSelector = ({ className }) => {
  const { theme, setLightTheme, setDarkTheme, setSystemTheme, mounted } = useTheme();

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={clsx('flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg', className)}>
        {/* Placeholder during SSR */}
      </div>
    );
  }

  const options = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  return (
    <div className={clsx('flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => {
            if (option.value === 'light') setLightTheme();
            else if (option.value === 'dark') setDarkTheme();
            else setSystemTheme();
          }}
          className={clsx(
            'flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
            theme === option.value || (option.value === 'system' && typeof window !== 'undefined' && !localStorage.getItem('theme'))
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          )}
        >
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};
