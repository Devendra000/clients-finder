export function highlightText(text: string, searchQuery: string): React.ReactNode {
  if (!searchQuery || !searchQuery.trim()) {
    return text
  }

  const searchWords = searchQuery.trim().split(/\s+/).filter(word => word.length > 0)
  
  // Create regex pattern for all search words
  const pattern = new RegExp(`(${searchWords.join('|')})`, 'gi')
  
  const parts = text.split(pattern)
  
  return parts.map((part, index) => {
    const isMatch = searchWords.some(word => 
      part.toLowerCase() === word.toLowerCase()
    )
    
    if (isMatch) {
      return (
        <mark key={index} className="bg-yellow-200 text-gray-900 font-semibold px-0.5 rounded">
          {part}
        </mark>
      )
    }
    
    return part
  })
}
