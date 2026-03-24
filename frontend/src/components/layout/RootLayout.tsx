import { Outlet } from 'react-router-dom'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </ErrorBoundary>
  )
}
