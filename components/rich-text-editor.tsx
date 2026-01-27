"use client"

import { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Link2, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = "Email content" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  // Set initial content when component mounts or value changes
  useEffect(() => {
    if (editorRef.current && value && !isInitialized) {
      editorRef.current.innerHTML = value
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleBold = () => executeCommand('bold')
  const handleItalic = () => executeCommand('italic')
  const handleUnderline = () => executeCommand('underline')
  const handleHeading1 = () => executeCommand('formatBlock', '<h1>')
  const handleHeading2 = () => executeCommand('formatBlock', '<h2>')
  const handleParagraph = () => executeCommand('formatBlock', '<p>')
  const handleUnorderedList = () => executeCommand('insertUnorderedList')
  const handleOrderedList = () => executeCommand('insertOrderedList')
  const handleAlignLeft = () => executeCommand('justifyLeft')
  const handleAlignCenter = () => executeCommand('justifyCenter')
  const handleAlignRight = () => executeCommand('justifyRight')

  const handleAddLink = () => {
    if (linkUrl) {
      executeCommand('createLink', linkUrl)
      setLinkUrl('')
      setLinkText('')
      setIsLinkDialogOpen(false)
    }
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap gap-1">
        <button
          onClick={handleBold}
          title="Bold"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={handleItalic}
          title="Italic"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={handleUnderline}
          title="Underline"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <Underline size={18} />
        </button>

        <div className="border-l border-gray-300 mx-1" />

        <button
          onClick={handleHeading1}
          title="Heading 1"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={handleHeading2}
          title="Heading 2"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={handleParagraph}
          title="Paragraph"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <Type size={18} />
        </button>

        <div className="border-l border-gray-300 mx-1" />

        <button
          onClick={handleUnorderedList}
          title="Bullet List"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <List size={18} />
        </button>
        <button
          onClick={handleOrderedList}
          title="Numbered List"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <ListOrdered size={18} />
        </button>

        <div className="border-l border-gray-300 mx-1" />

        <button
          onClick={handleAlignLeft}
          title="Align Left"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onClick={handleAlignCenter}
          title="Align Center"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onClick={handleAlignRight}
          title="Align Right"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <AlignRight size={18} />
        </button>

        <div className="border-l border-gray-300 mx-1" />

        <button
          onClick={() => setIsLinkDialogOpen(true)}
          title="Insert Link"
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <Link2 size={18} />
        </button>
      </div>

      {/* Link Dialog */}
      {isLinkDialogOpen && (
        <div className="bg-white border-b border-gray-300 p-3 flex gap-2">
          <input
            type="text"
            placeholder="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
          />
          <button
            onClick={handleAddLink}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Add Link
          </button>
          <button
            onClick={() => setIsLinkDialogOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        suppressContentEditableWarning
        className="min-h-80 p-4 focus:outline-none overflow-auto text-base leading-relaxed"
        style={{
          backgroundColor: '#ffffff'
        }}
        onPaste={(e) => {
          e.preventDefault()
          const text = e.clipboardData.getData('text/plain')
          document.execCommand('insertText', false, text)
        }}
      >
        {!value && <div className="text-gray-400">{placeholder}</div>}
      </div>

      {/* Hidden input to sync with form */}
      <input type="hidden" value={value} onChange={() => {}} />

      {/* Info Text */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-600">
        Use the toolbar above to format your email. The HTML will be preserved.
      </div>
    </div>
  )
}
