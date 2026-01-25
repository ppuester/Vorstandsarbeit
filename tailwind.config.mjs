import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [tailwindcssAnimate, typography],
  prefix: '',
  safelist: [
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    'border-border',
    'bg-card',
    'border-error',
    'bg-error/30',
    'border-success',
    'bg-success/30',
    'border-warning',
    'bg-warning/30',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        '2xl': '2rem',
        DEFAULT: '1rem',
        lg: '2rem',
        md: '2rem',
        sm: '1rem',
        xl: '2rem',
      },
      screens: {
        '2xl': '86rem',
        lg: '64rem',
        md: '48rem',
        sm: '40rem',
        xl: '80rem',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsla(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '-0.006em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '-0.011em' }],
        'lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.014em' }],
        'xl': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.017em' }],
        '2xl': ['1.5rem', { lineHeight: '1.35', letterSpacing: '-0.019em' }],
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.021em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.024em' }],
        '5xl': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.027em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        '7xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.032em' }],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
        normal: '-0.011em',
        wide: '0.01em',
      },
      lineHeight: {
        'tight': '1.2',
        'snug': '1.35',
        'normal': '1.5',
        'relaxed': '1.6',
        'loose': '1.75',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.foreground'),
            '--tw-prose-headings': theme('colors.foreground'),
            '--tw-prose-links': 'hsl(var(--primary))',
            '--tw-prose-bold': theme('colors.foreground'),
            '--tw-prose-counters': theme('colors.muted.foreground'),
            '--tw-prose-bullets': theme('colors.muted.foreground'),
            '--tw-prose-quotes': theme('colors.muted.foreground'),
            '--tw-prose-code': theme('colors.foreground'),
            '--tw-prose-hr': theme('colors.border'),
            fontSize: '1.0625rem',
            lineHeight: '1.75',
            maxWidth: 'none',
            h1: {
              fontSize: '2.25rem',
              fontWeight: '700',
              letterSpacing: '-0.025em',
              lineHeight: '1.2',
            },
            h2: {
              fontSize: '1.5rem',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              lineHeight: '1.3',
              marginTop: '2em',
            },
            h3: {
              fontSize: '1.25rem',
              fontWeight: '600',
              letterSpacing: '-0.015em',
              lineHeight: '1.4',
            },
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            a: {
              fontWeight: '500',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              '&:hover': {
                opacity: '0.8',
              },
            },
            strong: {
              fontWeight: '600',
            },
            code: {
              fontWeight: '400',
              fontSize: '0.875em',
            },
          },
        },
      }),
    },
  },
}

export default config
