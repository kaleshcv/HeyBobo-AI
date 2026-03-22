import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceDelay?: number
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search courses...',
  onSearch,
  debounceDelay = 300,
}) => {
  const [query, setQuery] = React.useState('')
  const debouncedQuery = useDebounce(query, debounceDelay)

  React.useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  return (
    <Input
      placeholder={placeholder}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      icon={<Search size={20} />}
    />
  )
}
