/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'], // Usar data-theme para dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2f6feb',
          dark: '#1f5dd5',
          light: '#7ea4ff',
        },
        accent: {
          DEFAULT: '#2f6feb',
          dark: '#1f5dd5',
          light: '#7ea4ff',
        },
        // Cores semânticas padronizadas
        success: {
          DEFAULT: '#10b981',
          dark: '#059669',
          light: '#34d399',
        },
        error: {
          DEFAULT: '#ef4444',
          dark: '#dc2626',
          light: '#f87171',
        },
        warning: {
          DEFAULT: '#f59e0b',
          dark: '#d97706',
          light: '#fbbf24',
        },
        info: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#60a5fa',
        },
      },
      spacing: {
        // Espaçamento consistente
        '18': '4.5rem', // 72px
        '88': '22rem',  // 352px
      },
      fontSize: {
        // Escala tipográfica consistente
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      },
      boxShadow: {
        // Elevação consistente - sombras suaves modernas
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(47, 111, 235, 0.26)',
        'glow-accent': '0 0 20px rgba(47, 111, 235, 0.34)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        // Bordas arredondadas consistentes - mais modernas
        'card': '0.75rem', // 12px para cards
        'button': '0.5rem', // 8px para botões
        'xl': '1rem', // 16px para elementos grandes
        '2xl': '1.25rem', // 20px para modais
        'full': '9999px', // Totalmente arredondado
      },
    },
  },
  plugins: [],
}
