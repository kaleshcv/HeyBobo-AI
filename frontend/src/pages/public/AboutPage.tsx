import { Card } from '@/components/ui/Card'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-navy-800 mb-8">About HeyBobo</h1>
      <Card className="mb-8">
        <p className="text-lg text-navy-600 leading-relaxed mb-4">
          Heybobo is a world-class learning platform dedicated to making education accessible to everyone, everywhere. Our mission is to empower individuals and organizations with the knowledge and skills they need to succeed in an increasingly digital world.
        </p>
        <p className="text-lg text-navy-600 leading-relaxed">
          Whether you're a student looking to advance your career, a professional seeking to expand your expertise, or an organization wanting to invest in employee development, Heybobo has the courses and tools you need.
        </p>
      </Card>
    </div>
  )
}
