import { createTheme, Theme } from '@mui/material/styles';

// ─── Dubai Gold & Navy — Dark Theme ─────────────────────────────────────────
export const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main:         '#C9A84C',
      light:        '#E5B84E',
      dark:         '#A8862A',
      contrastText: '#0D1B2A',
    },
    secondary: {
      main:         '#2D4A6E',
      light:        '#537ba6',
      dark:         '#0D1B2A',
      contrastText: '#C9A84C',
    },
    background: {
      default: '#0D1B2A',
      paper:   '#1A2B3C',
    },
    text: {
      primary:   '#F5F0E8',
      secondary: '#B8C8D8',
      disabled:  '#5a7a9a',
    },
    divider:  '#2D4A6E',
    action: {
      hover:    'rgba(201,168,76,0.08)',
      selected: 'rgba(201,168,76,0.15)',
      active:   'rgba(201,168,76,0.2)',
    },
    error:   { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    success: { main: '#10b981' },
    info:    { main: '#38bdf8' },
  },
  typography: {
    fontFamily: '"Cairo", "Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' as const },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background:     'linear-gradient(180deg, #0a1628 0%, #0D1B2A 100%)',
          borderRight:    '1px solid rgba(201,168,76,0.15)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            background:  'linear-gradient(135deg, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.1) 100%)',
            borderLeft:  '3px solid #C9A84C',
            marginLeft:  '5px',
            color:       '#C9A84C',
          },
          '&:hover': {
            background:  'rgba(201,168,76,0.07)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': { background: 'rgba(201,168,76,0.1)' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' as const, fontWeight: 600, borderRadius: 10 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)',
          color:      '#0D1B2A',
          boxShadow:  '0 4px 15px rgba(201,168,76,0.3)',
        },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: 'rgba(201,168,76,0.15)' } } },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background:      '#1A2B3C',
          border:          '1px solid rgba(201,168,76,0.13)',
          boxShadow:       '0 4px 24px rgba(0,0,0,0.35)',
          transition:      'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(201,168,76,0.25)',
            boxShadow:   '0 6px 32px rgba(0,0,0,0.45)',
          },
        },
        outlined: {
          border:    '1px solid rgba(201,168,76,0.15)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
        },
        elevation1:  { boxShadow: '0 2px 12px rgba(0,0,0,0.3)' },
        elevation2:  { boxShadow: '0 4px 20px rgba(0,0,0,0.35)' },
        elevation3:  { boxShadow: '0 6px 28px rgba(0,0,0,0.4)' },
        elevation4:  { boxShadow: '0 8px 36px rgba(0,0,0,0.45)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background:      '#1A2B3C',
          border:          '1px solid rgba(201,168,76,0.12)',
          boxShadow:       '0 4px 24px rgba(0,0,0,0.4)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(201,168,76,0.25)' },
            '&:hover fieldset': { borderColor: 'rgba(201,168,76,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#C9A84C' },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root:          { borderRadius: 6, height: 6, backgroundColor: 'rgba(201,168,76,0.15)' },
        bar:           { borderRadius: 6, background: 'linear-gradient(90deg, #C9A84C 0%, #E5B84E 100%)' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius:    10,
          border:          '1px solid rgba(201,168,76,0.2)',
          backdropFilter:  'blur(8px)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background:   '#1A2B3C',
          border:       '1px solid rgba(201,168,76,0.2)',
          color:        '#F5F0E8',
          borderRadius: 8,
          fontSize:     12,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #C9A84C 0%, #A8862A 100%)',
          color:      '#0D1B2A',
          fontWeight: 700,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight:   600,
          border:       '1px solid rgba(201,168,76,0.2)',
        },
        filled: {
          background: 'rgba(201,168,76,0.15)',
          color:      '#C9A84C',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root:   { borderBottomColor: 'rgba(201,168,76,0.12)' },
        head:   { fontWeight: 700, color: '#C9A84C' },
      },
    },
  },
});

// ─── Dubai White & Emerald — Light Theme ────────────────────────────────────
export const lightTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:         '#00843D',
      light:        '#00A650',
      dark:         '#006B32',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main:         '#F0FAF5',
      light:        '#FFFFFF',
      dark:         '#c2e6d2',
      contrastText: '#00843D',
    },
    background: {
      default: '#F8F9FA',
      paper:   '#FFFFFF',
    },
    text: {
      primary:   '#1C1C1C',
      secondary: '#4A5568',
      disabled:  '#9AA5B1',
    },
    divider:  '#E2EBE8',
    action: {
      hover:    'rgba(0,132,61,0.06)',
      selected: 'rgba(0,132,61,0.12)',
      active:   'rgba(0,132,61,0.18)',
    },
    error:   { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    success: { main: '#00843D' },
    info:    { main: '#0ea5e9' },
  },
  typography: {
    fontFamily: '"Cairo", "Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' as const },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background:  '#FFFFFF',
          borderRight: '1px solid #E2EBE8',
          boxShadow:   '2px 0 20px rgba(0,132,61,0.06)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            background:  'linear-gradient(135deg, rgba(0,132,61,0.12) 0%, rgba(0,166,80,0.07) 100%)',
            borderLeft:  '3px solid #00843D',
            marginLeft:  '5px',
            color:       '#00843D',
          },
          '&:hover': {
            background:  'rgba(0,132,61,0.05)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': { background: 'rgba(0,132,61,0.08)' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' as const, fontWeight: 600, borderRadius: 10 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00843D 0%, #00A650 100%)',
          boxShadow:  '0 4px 15px rgba(0,132,61,0.25)',
        },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: '#E2EBE8' } } },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background:      '#FFFFFF',
          border:          '1px solid rgba(0,132,61,0.1)',
          boxShadow:       '0 2px 20px rgba(0,132,61,0.07)',
          transition:      'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(0,132,61,0.2)',
            boxShadow:   '0 4px 28px rgba(0,132,61,0.12)',
          },
        },
        outlined: {
          border:    '1px solid rgba(0,132,61,0.12)',
          boxShadow: '0 2px 16px rgba(0,132,61,0.06)',
        },
        elevation1:  { boxShadow: '0 1px 10px rgba(0,132,61,0.08)' },
        elevation2:  { boxShadow: '0 2px 16px rgba(0,132,61,0.10)' },
        elevation3:  { boxShadow: '0 4px 22px rgba(0,132,61,0.12)' },
        elevation4:  { boxShadow: '0 6px 28px rgba(0,132,61,0.14)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background:      '#FFFFFF',
          border:          '1px solid rgba(0,132,61,0.1)',
          boxShadow:       '0 2px 16px rgba(0,132,61,0.07)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(0,132,61,0.25)' },
            '&:hover fieldset': { borderColor: '#00843D' },
            '&.Mui-focused fieldset': { borderColor: '#00843D' },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root:          { borderRadius: 6, height: 6, backgroundColor: 'rgba(0,132,61,0.1)' },
        bar:           { borderRadius: 6, background: 'linear-gradient(90deg, #00843D 0%, #00A650 100%)' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background:   '#1C1C1C',
          color:        '#FFFFFF',
          borderRadius: 8,
          fontSize:     12,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #00843D 0%, #00A650 100%)',
          color:      '#FFFFFF',
          fontWeight: 700,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight:   600,
        },
        filled: {
          background: 'rgba(0,132,61,0.1)',
          color:      '#00843D',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root:   { borderBottomColor: 'rgba(0,132,61,0.1)' },
        head:   { fontWeight: 700, color: '#00843D' },
      },
    },
  },
});

export default lightTheme;
