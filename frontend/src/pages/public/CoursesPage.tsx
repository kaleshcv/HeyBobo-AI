import { useState } from 'react'
import { Filter } from 'lucide-react'
import { CourseCard } from '@/components/common/CourseCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/ui/Pagination'
import { useCourses } from '@/hooks/useCourses'
import { Spinner } from '@/components/ui/Spinner'
import { CourseFilter } from '@/types/index'

export default function CoursesPage() {
  const [filters, setFilters] = useState<CourseFilter>({ page: 1, pageSize: 12 })
  const { data, isLoading } = useCourses(filters)

  const handleFilterChange = (newFilters: Partial<CourseFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Courses</h1>
        <p className="text-gray-600 text-lg">Find the perfect course to level up your skills</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Filter size={20} />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Course name..."
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Level */}
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">
                  Level
                </label>
                <Select
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                  ]}
                  onChange={(e) => handleFilterChange({ level: e.target.value })}
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">
                  Price
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        handleFilterChange(
                          e.target.checked ? { priceMin: 0, priceMax: 0 } : {}
                        )
                      }
                    />
                    <span className="text-sm">Free</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        handleFilterChange(
                          e.target.checked ? { priceMin: 1 } : {}
                        )
                      }
                    />
                    <span className="text-sm">Paid</span>
                  </label>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">
                  Sort By
                </label>
                <Select
                  options={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'popular', label: 'Most Popular' },
                    { value: 'rating', label: 'Highest Rated' },
                    { value: 'price_low', label: 'Price: Low to High' },
                    { value: 'price_high', label: 'Price: High to Low' },
                  ]}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                />
              </div>

              <Button fullWidth variant="outline">
                Reset Filters
              </Button>
            </div>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {data.data.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {data.totalPages > 1 && (
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <Card className="text-center py-12">
              <p className="text-gray-600">No courses found. Try adjusting your filters.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
