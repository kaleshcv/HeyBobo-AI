import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle className="w-24 h-24 text-yellow-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-2">Page Not Found</p>
        <p className="text-gray-500 mb-8">Sorry, the page you're looking for doesn't exist.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/')}>Go Home</Button>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </div>
      </div>
    </div>
  )
}
