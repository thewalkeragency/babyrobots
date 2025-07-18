module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Music Industry Color Palette - Dark theme primary with electric blues
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe', 
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Electric Blues - Indii.Music brand colors
        electric: {
          50: '#f0fdff',
          100: '#ccfbff',
          200: '#99f6ff',
          300: '#66f0ff',
          400: '#00d4ff', // Primary electric blue
          500: '#0066cc', // Deep electric blue
          600: '#003d7a', // Dark electric blue
          700: '#002952',
          800: '#001a33',
          900: '#000d1a',
        },
        // Audio Industry Colors
        audio: {
          levels: '#00ff88',    // Green for audio levels
          warning: '#ff6b35',   // Orange for warnings
          peak: '#ff1744',      // Red for peaks
          highlight: '#ffd700', // Gold for highlights
          spectrum: '#9c27b0',  // Purple for spectrum
        },
        // Professional Grays
        technical: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Deep blacks for music industry aesthetic
        studio: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c0c0c0',
          400: '#808080',
          500: '#404040',
          600: '#2a2a2a',
          700: '#1a1a1a',
          800: '#0f0f0f',
          900: '#0a0a0a',
        },
        // User role colors with enhanced accessibility
        artist: {
          light: '#a855f7',
          DEFAULT: '#8B5CF6',
          dark: '#7c3aed',
        },
        fan: {
          light: '#34d399',
          DEFAULT: '#10B981', 
          dark: '#059669',
        },
        licensor: {
          light: '#fbbf24',
          DEFAULT: '#F59E0B',
          dark: '#d97706',
        },
        provider: {
          light: '#f87171',
          DEFAULT: '#EF4444',
          dark: '#dc2626',
        },
        legal: {
          light: '#818cf8',
          DEFAULT: '#6366F1',
          dark: '#4f46e5',
        },
        general: {
          light: '#9ca3af',
          DEFAULT: '#6B7280',
          dark: '#4b5563',
        },
        // Semantic colors
        background: {
          light: '#ffffff',
          DEFAULT: '#f8fafc',
          dark: '#0f172a',
        },
        surface: {
          light: '#ffffff',
          DEFAULT: '#f1f5f9',
          dark: '#1e293b',
        },
        border: {
          light: '#e2e8f0',
          DEFAULT: '#cbd5e1',
          dark: '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'tilt': 'tilt 10s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        tilt: {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(1deg)' },
          '75%': { transform: 'rotate(-1deg)' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)',
        'glow': '0 0 20px rgb(59 130 246 / 0.5)',
        'glow-sm': '0 0 10px rgb(59 130 246 / 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
