export const APP_THEME = {
  typography: {
    fontFamilyPrimary: '"Battambang", "Khmer OS Battambang", system-ui, sans-serif',
    fontFamilyBranding: '"Bokor", cursive, sans-serif',
    lineHeightBase: 1.6,
  },

  touchTargets: {
    minHeightStandard: '44px',
    minHeightLarge: '48px',
    minWidthTouch: '44px',
  },

  colors: {
    brand: {
      primary: '#4f46e5', // indigo-600
      primaryHover: '#4338ca', // indigo-700
      primaryBg: '#eef2ff', // indigo-50
    },
    income: {
      main: '#059669', // emerald-600
      bg: '#ecfdf5', // emerald-50
      text: '#065f46', // emerald-800
    },
    expense: {
      main: '#e11d48', // rose-600
      bg: '#fff1f2', // rose-50
      text: '#9f1239', // rose-800
    },
    warning: {
      main: '#d97706', // amber-600
      bg: '#fffbeb', // amber-50
      text: '#92400e', // amber-800
    },
    neutral: {
      canvas: '#f8fafc', // slate-50
      surface: '#ffffff',
      border: '#e2e8f0', // slate-200
      textMain: '#0f172a', // slate-900
      textMuted: '#64748b', // slate-500
      textLight: '#94a3b8', // slate-400
    },
  },

  borderRadius: {
    button: 'rounded-xl', // 12px
    card: 'rounded-2xl', // 16px
    modal: 'rounded-3xl', // 24px
    badge: 'rounded-lg', // 8px
    pill: 'rounded-full',
  },

  shadows: {
    card: 'shadow-2xs hover:shadow-md',
    modal: 'shadow-2xl',
  },
} as const;
