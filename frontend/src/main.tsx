import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import DubaiGlobalStyles from '@/components/common/DubaiGlobalStyles'
import { router } from '@/router'
import { queryClient } from '@/lib/queryClient'
import { darkTheme, lightTheme } from '@/theme'
import { useUIStore } from '@/store/uiStore'
import '@/lib/errorLogger'
import './index.css'

function ThemedApp() {
  const theme    = useUIStore((s) => s.theme)
  const language = useUIStore((s) => s.language)
  const isRTL    = useUIStore((s) => s.isRTL)
  const muiTheme = theme === 'dark' ? darkTheme : lightTheme

  // Tailwind dark class on <html>
  React.useEffect(() => {
    const html = document.documentElement
    if (theme === 'dark') html.classList.add('dark')
    else html.classList.remove('dark')
  }, [theme])

  // RTL direction
  React.useEffect(() => {
    document.documentElement.dir  = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [isRTL, language])

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <DubaiGlobalStyles />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position={isRTL ? 'top-left' : 'top-right'}
          toastOptions={{
            style: {
              background:   theme === 'dark' ? '#1A2B3C' : '#FFFFFF',
              color:        theme === 'dark' ? '#F5F0E8' : '#1C1C1C',
              border:       theme === 'dark'
                ? '1px solid rgba(201,168,76,0.25)'
                : '1px solid rgba(0,132,61,0.15)',
              borderRadius: '12px',
              fontFamily:   '"Cairo", "Inter", sans-serif',
              boxShadow:    theme === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.5)'
                : '0 4px 20px rgba(0,132,61,0.12)',
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemedApp />
    </ErrorBoundary>
  </React.StrictMode>
)
