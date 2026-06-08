export const theme = {
  colors: {
    background: '#FFFFFF',
    secondaryBackground: '#F8F9FA',
    textPrimary: '#1A1A1A',
    textSecondary: '#4B5563',
    accentGreen: '#2C553C',
    accentWarm: '#D4A373',
    border: '#E5E7EB',
    error: '#C62828',
    success: '#2E7D32',
    white: '#FFFFFF',
  },
  typography: {
    heading: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 700,
      sizes: {
        hero: '48px',
        section: '32px',
        card: '24px',
      },
    },
    body: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 400,
      size: '16px',
      lineHeight: 1.5,
    },
    small: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 400,
      size: '14px',
      lineHeight: 1.4,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

export type Theme = typeof theme;
