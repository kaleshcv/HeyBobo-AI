import { GlobalStyles, useTheme } from '@mui/material'

/**
 * DubaiGlobalStyles
 * Injects rich CSS into every page. Transforms the flat "Word document" look
 * into a visually deep, Dubai-themed interface — without touching individual page files.
 */
export default function DubaiGlobalStyles() {
  const theme  = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Dubai colour tokens
  const accent       = isDark ? '#C9A84C' : '#00843D'
  const accentLight  = isDark ? '#E5B84E' : '#00A650'
  const bg           = isDark ? '#0D1B2A' : '#F0FAF5'
  const surface      = isDark ? '#1A2B3C' : '#FFFFFF'
  const border       = isDark ? 'rgba(201,168,76,0.14)' : 'rgba(0,132,61,0.12)'
  const shadow       = isDark
    ? '0 4px 24px rgba(0,0,0,0.4)'
    : '0 4px 20px rgba(0,132,61,0.09)'
  const shadowHover  = isDark
    ? '0 8px 36px rgba(0,0,0,0.55)'
    : '0 8px 32px rgba(0,132,61,0.15)'
  const textPrimary  = isDark ? '#F5F0E8' : '#1C1C1C'

  return (
    <GlobalStyles styles={{
      /* ── Page background ─────────────────────────────────────── */
      'html, body': {
        background:  `${bg} !important`,
        fontFamily:  '"Cairo", "Inter", sans-serif !important',
        color:       `${textPrimary} !important`,
        minHeight:   '100vh',
      },
      '#root': {
        background: bg,
        minHeight:  '100vh',
      },

      /* ── App content background pattern ─────────────────────── */
      'main': {
        background: isDark
          ? `radial-gradient(ellipse at 20% 20%, rgba(201,168,76,0.04) 0%, transparent 50%),
             radial-gradient(ellipse at 80% 80%, rgba(45,74,110,0.3) 0%, transparent 50%),
             ${bg}`
          : `radial-gradient(ellipse at 10% 10%, rgba(0,132,61,0.04) 0%, transparent 50%),
             radial-gradient(ellipse at 90% 90%, rgba(0,166,80,0.03) 0%, transparent 50%),
             ${bg}`,
      },

      /* ── Paper / Card global treatment ──────────────────────── */
      '.MuiPaper-root': {
        background:   `${surface} !important`,
        border:       `1px solid ${border} !important`,
        boxShadow:    `${shadow} !important`,
        borderRadius: '12px !important',
        backgroundImage: 'none !important',
        transition:   'box-shadow 0.25s ease, border-color 0.25s ease, transform 0.2s ease !important',
      },
      '.MuiPaper-root:hover': {
        boxShadow: `${shadowHover} !important`,
      },

      /* Drawer paper keeps its gradient, don't override */
      '.MuiDrawer-paper': {
        background: isDark
          ? 'linear-gradient(180deg, #0a1628 0%, #0D1B2A 100%) !important'
          : '#FFFFFF !important',
        boxShadow: isDark
          ? '4px 0 32px rgba(0,0,0,0.6) !important'
          : '4px 0 24px rgba(0,132,61,0.08) !important',
        borderRight: `1px solid ${border} !important`,
      },

      /* ── Typography ──────────────────────────────────────────── */
      '.MuiTypography-h4, .MuiTypography-h5, .MuiTypography-h6': {
        fontFamily: '"Cairo", "Inter", sans-serif !important',
        fontWeight: '700 !important',
        color: `${textPrimary} !important`,
        letterSpacing: '-0.01em',
      },
      '.MuiTypography-subtitle1': {
        fontWeight: '600 !important',
        color: `${textPrimary} !important`,
      },
      '.MuiTypography-body1, .MuiTypography-body2': {
        fontFamily: '"Cairo", "Inter", sans-serif !important',
      },

      /* ── Section page headers / hero rows ───────────────────── */
      /* Targets the first Box with a gradient background icon inside pages */
      '.dubai-page-header': {
        background: isDark
          ? 'linear-gradient(135deg, #1A2B3C 0%, #152e4f 100%)'
          : 'linear-gradient(135deg, #EDFAF3 0%, #D1F5E2 100%)',
        border:       `1px solid ${border}`,
        borderRadius: 16,
        padding:      '24px 28px',
        marginBottom: 24,
        boxShadow:    shadow,
        position:     'relative',
        overflow:     'hidden',
      },
      '.dubai-page-header::before': {
        content:      '""',
        position:     'absolute',
        top:          -40,
        right:        -40,
        width:        160,
        height:       160,
        borderRadius: '50%',
        background:   isDark
          ? 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(0,132,61,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      },

      /* ── MUI Avatar — Dubai gradient ─────────────────────────── */
      '.MuiAvatar-root': {
        background: isDark
          ? 'linear-gradient(135deg, #C9A84C 0%, #A8862A 100%) !important'
          : 'linear-gradient(135deg, #00843D 0%, #00A650 100%) !important',
        fontWeight: '700 !important',
        color: isDark ? '#0D1B2A !important' : '#FFFFFF !important',
        border: `2px solid ${isDark ? 'rgba(201,168,76,0.3)' : 'rgba(0,132,61,0.2)'} !important`,
      },

      /* ── Buttons ─────────────────────────────────────────────── */
      '.MuiButton-containedPrimary': {
        background:  `linear-gradient(135deg, ${accent} 0%, ${accentLight} 100%) !important`,
        color:       `${isDark ? '#0D1B2A' : '#FFFFFF'} !important`,
        boxShadow:   `0 4px 16px ${isDark ? 'rgba(201,168,76,0.3)' : 'rgba(0,132,61,0.25)'} !important`,
        fontWeight:  '700 !important',
        borderRadius:'10px !important',
        textTransform: 'none !important',
        '&:hover': {
          boxShadow: `0 6px 24px ${isDark ? 'rgba(201,168,76,0.45)' : 'rgba(0,132,61,0.35)'} !important`,
        },
      },
      '.MuiButton-outlined': {
        border:       `1px solid ${isDark ? 'rgba(201,168,76,0.35)' : 'rgba(0,132,61,0.3)'} !important`,
        color:        `${accent} !important`,
        borderRadius: '10px !important',
        textTransform:'none !important',
        fontWeight:   '600 !important',
      },
      '.MuiButton-text': {
        color:        `${accent} !important`,
        textTransform:'none !important',
        fontWeight:   '600 !important',
      },

      /* ── Chips ───────────────────────────────────────────────── */
      '.MuiChip-root': {
        borderRadius: '8px !important',
        fontWeight:   '600 !important',
        fontFamily:   '"Cairo", "Inter", sans-serif !important',
      },
      '.MuiChip-filled': {
        background: isDark
          ? 'rgba(201,168,76,0.15) !important'
          : 'rgba(0,132,61,0.09) !important',
        color:     `${accent} !important`,
        border:    `1px solid ${border} !important`,
      },

      /* ── Linear progress bars ───────────────────────────────── */
      '.MuiLinearProgress-root': {
        borderRadius:    '6px !important',
        height:          '6px !important',
        backgroundColor: isDark
          ? 'rgba(201,168,76,0.12) !important'
          : 'rgba(0,132,61,0.08) !important',
      },
      '.MuiLinearProgress-bar': {
        background:   `linear-gradient(90deg, ${accent} 0%, ${accentLight} 100%) !important`,
        borderRadius: '6px !important',
      },

      /* ── Dividers ────────────────────────────────────────────── */
      '.MuiDivider-root': {
        borderColor: `${border} !important`,
      },

      /* ── Inputs / TextFields ─────────────────────────────────── */
      '.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        borderColor:  `${border} !important`,
        borderRadius: '10px !important',
      },
      '.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: `${accent} !important`,
      },
      '.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: `${accent} !important`,
        borderWidth: '2px !important',
      },
      '.MuiInputLabel-root.Mui-focused': {
        color: `${accent} !important`,
      },

      /* ── Tabs ────────────────────────────────────────────────── */
      '.MuiTabs-indicator': {
        background:    `linear-gradient(90deg, ${accent} 0%, ${accentLight} 100%) !important`,
        height:        '3px !important',
        borderRadius:  '2px 2px 0 0 !important',
      },
      '.MuiTab-root.Mui-selected': {
        color:      `${accent} !important`,
        fontWeight: '700 !important',
      },

      /* ── Table ───────────────────────────────────────────────── */
      '.MuiTableHead-root .MuiTableCell-root': {
        color:       `${accent} !important`,
        fontWeight:  '700 !important',
        borderBottom:`2px solid ${border} !important`,
        background:  isDark
          ? 'rgba(201,168,76,0.06) !important'
          : 'rgba(0,132,61,0.04) !important',
      },

      /* ── Page title accent lines (inline with Dubai gold/green) */
      '.dubai-accent': {
        display:      'inline-block',
        height:        3,
        width:         48,
        borderRadius:  2,
        background:   `linear-gradient(90deg, ${accent}, ${accentLight})`,
        marginTop:     8,
        marginBottom:  4,
      },

      /* ── Scrollbar (global) ───────────────────────────────────── */
      '::-webkit-scrollbar':       { width: 6, height: 6 },
      '::-webkit-scrollbar-track': { background: 'transparent' },
      '::-webkit-scrollbar-thumb': {
        background:   isDark ? 'rgba(201,168,76,0.22)' : 'rgba(0,132,61,0.18)',
        borderRadius: 3,
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: isDark ? 'rgba(201,168,76,0.4)' : 'rgba(0,132,61,0.35)',
      },

      /* ── Skeleton shimmer ─────────────────────────────────────── */
      '.MuiSkeleton-root': {
        background: isDark
          ? 'rgba(201,168,76,0.08) !important'
          : 'rgba(0,132,61,0.06) !important',
      },

      /* ── Alert boxes ─────────────────────────────────────────── */
      '.MuiAlert-root': {
        borderRadius: '10px !important',
        border:       `1px solid ${border} !important`,
        fontFamily:   '"Cairo", "Inter", sans-serif !important',
      },
    }} />
  )
}
