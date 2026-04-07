import { Card } from '@/components/ui/Card'
import { AnimatedPage } from '@/components/animations'

export default function Page() {
  return (
    <AnimatedPage>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-navy-800">Page Content</h1>
        <Card>
          <p className="text-navy-500">This page is under development</p>
        </Card>
      </div>
    </AnimatedPage>
  )
}
