import { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Type,
  ChevronDown,
  Check,
  Highlighter,
  Baseline,
  Eraser,
  Palette
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface EditorBubbleMenuProps {
  editor: Editor
}

const FONT_SIZES = Array.from({ length: (56 - 8) / 4 + 1 }, (_, i) => 8 + i * 4)

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', color: '#fef08a' },
  { label: 'Green', color: '#bbf7d0' },
  { label: 'Blue', color: '#bfdbfe' },
  { label: 'Pink', color: '#fbcfe8' },
  { label: 'Purple', color: '#e9d5ff' },
]

const TEXT_COLORS = [
  { label: 'Gray', color: '#4b5563' },
  { label: 'Red', color: '#ef4444' },
  { label: 'Orange', color: '#f97316' },
  { label: 'Green', color: '#22c55e' },
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Purple', color: '#a855f7' },
]

export const EditorBubbleMenu = ({ editor }: EditorBubbleMenuProps) => {
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false)
  const [isHighlightOpen, setIsHighlightOpen] = useState(false)
  const [isTextColorOpen, setIsTextColorOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const textColorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsFontSizeOpen(false)
      }
      if (highlightRef.current && !highlightRef.current.contains(event.target as Node)) {
        setIsHighlightOpen(false)
      }
      if (textColorRef.current && !textColorRef.current.contains(event.target as Node)) {
        setIsTextColorOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!editor) {
    return null
  }

  const toggleFontSize = () => setIsFontSizeOpen(!isFontSizeOpen)
  const toggleHighlight = () => setIsHighlightOpen(!isHighlightOpen)
  const toggleTextColor = () => setIsTextColorOpen(!isTextColorOpen)

  const setFontSize = (size: number) => {
    if (size === 16) {
      editor.chain().focus().unsetFontSize().run()
    } else {
      editor.chain().focus().setFontSize(`${size}px`).run()
    }
    setIsFontSizeOpen(false)
  }

  const setHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run()
    setIsHighlightOpen(false)
  }

  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run()
    setIsTextColorOpen(false)
  }

  const currentFontSizeStr = editor.getAttributes('textStyle').fontSize || '16px'
  const currentFontSize = parseInt(currentFontSizeStr) || 16

  return (
    <BubbleMenu 
      editor={editor} 
      options={{ placement: 'top' }}
      className="flex items-center gap-1 bg-white border border-gray-200 shadow-lg rounded-lg p-1.5"
    >
      <div className="relative" ref={menuRef}>
        <button
          onClick={toggleFontSize}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-100 text-sm font-medium transition-colors ${
            isFontSizeOpen ? 'bg-gray-100' : ''
          }`}
        >
          <Type size={16} />
          <span className="w-8 text-center">{currentFontSize}</span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>

        {isFontSizeOpen && (
          <div className="absolute top-full left-0 mt-1 w-24 max-h-60 overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-lg py-1 z-50">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
              >
                <span>{size}</span>
                {currentFontSize === size && <Check size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative" ref={highlightRef}>
        <button
          onClick={toggleHighlight}
          className={`flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
            editor.isActive('highlight') ? 'bg-gray-100 text-purple-600' : 'text-gray-700'
          }`}
          title="Highlight"
        >
          <Highlighter size={16} />
        </button>

        {isHighlightOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-lg p-2 z-50 flex flex-col gap-2">
            <div className="flex gap-1 flex-wrap">
              {HIGHLIGHT_COLORS.map(({ label, color }) => (
                <button
                  key={color}
                  onClick={() => setHighlight(color)}
                  className="w-6 h-6 rounded-full border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: color }}
                  title={label}
                />
              ))}
              <div className="relative w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 flex-shrink-0 overflow-hidden" title="Custom color">
                <Palette size={14} className="pointer-events-none" />
                <input
                  type="color"
                  className="absolute inset-0 w-8 h-8 -ml-1 -mt-1 opacity-0 cursor-pointer"
                  onChange={(e) => setHighlight(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run()
                  setIsHighlightOpen(false)
                }}
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 flex-shrink-0"
                title="Remove Highlight"
              >
                <Eraser size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={textColorRef}>
        <button
          onClick={toggleTextColor}
          className={`flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
            editor.getAttributes('textStyle').color ? 'bg-gray-100 text-purple-600' : 'text-gray-700'
          }`}
          title="Text Color"
        >
          <Baseline size={16} />
        </button>

        {isTextColorOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-lg p-2 z-50 flex flex-col gap-2">
            <div className="flex gap-1 flex-wrap">
              {TEXT_COLORS.map(({ label, color }) => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  className="w-6 h-6 rounded-full border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: color }}
                  title={label}
                />
              ))}
              <div className="relative w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 flex-shrink-0 overflow-hidden" title="Custom color">
                <Palette size={14} className="pointer-events-none" />
                <input
                  type="color"
                  className="absolute inset-0 w-8 h-8 -ml-1 -mt-1 opacity-0 cursor-pointer"
                  onChange={(e) => setTextColor(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  editor.chain().focus().unsetColor().run()
                  setIsTextColorOpen(false)
                }}
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 flex-shrink-0"
                title="Reset Color"
              >
                <Eraser size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
          editor.isActive('bold') ? 'bg-gray-100 text-purple-600' : 'text-gray-700'
        }`}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
          editor.isActive('italic') ? 'bg-gray-100 text-purple-600' : 'text-gray-700'
        }`}
        title="Italic"
      >
        <Italic size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
          editor.isActive('underline') ? 'bg-gray-100 text-purple-600' : 'text-gray-700'
        }`}
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
          editor.isActive('strike') ? 'bg-gray-100 text-purple-600' : 'text-gray-700'
        }`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
          editor.isActive('code') ? 'bg-gray-100 text-purple-600' : 'text-gray-700'
        }`}
        title="Code"
      >
        <Code size={16} />
      </button>
    </BubbleMenu>
  )
}
