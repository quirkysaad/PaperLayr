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
      className="flex items-center gap-0.5 bg-white/95 backdrop-blur-md border border-zinc-200/80 shadow-[0_12px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.05)] rounded-xl p-1 z-50"
    >
      <div className="relative" ref={menuRef}>
        <button
          onClick={toggleFontSize}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-zinc-100 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer ${
            isFontSizeOpen ? 'bg-zinc-100' : ''
          }`}
        >
          <Type size={14} />
          <span className="w-5 text-center">{currentFontSize}</span>
          <ChevronDown size={12} className="text-zinc-400" />
        </button>

        {isFontSizeOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-24 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-md border border-zinc-200/80 shadow-xl rounded-xl p-1 z-50">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className="w-full px-2.5 py-1.5 text-left text-xs font-medium hover:bg-zinc-100 rounded-lg flex items-center justify-between text-zinc-700 transition-colors"
              >
                <span>{size}px</span>
                {currentFontSize === size && <Check size={12} className="text-blue-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative" ref={highlightRef}>
        <button
          onClick={toggleHighlight}
          className={`flex items-center justify-center p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer ${
            editor.isActive('highlight') ? 'bg-blue-50 text-blue-600' : 'text-zinc-600'
          }`}
          title="Highlight"
        >
          <Highlighter size={15} />
        </button>

        {isHighlightOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-48 bg-white/95 backdrop-blur-md border border-zinc-200/80 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-2">
            <div className="flex gap-1.5 flex-wrap">
              {HIGHLIGHT_COLORS.map(({ label, color }) => (
                <button
                  key={color}
                  onClick={() => setHighlight(color)}
                  className="w-6 h-6 rounded-full border border-zinc-200 flex-shrink-0 cursor-pointer shadow-2xs hover:scale-105 transition-transform"
                  style={{ backgroundColor: color }}
                  title={label}
                />
              ))}
              <div className="relative w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 flex-shrink-0 overflow-hidden cursor-pointer" title="Custom color">
                <Palette size={13} className="pointer-events-none" />
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
                className="w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 flex-shrink-0 cursor-pointer"
                title="Remove Highlight"
              >
                <Eraser size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={textColorRef}>
        <button
          onClick={toggleTextColor}
          className={`flex items-center justify-center p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer ${
            editor.getAttributes('textStyle').color ? 'bg-blue-50 text-blue-600' : 'text-zinc-600'
          }`}
          title="Text Color"
        >
          <Baseline size={15} />
        </button>

        {isTextColorOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-48 bg-white/95 backdrop-blur-md border border-zinc-200/80 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-2">
            <div className="flex gap-1.5 flex-wrap">
              {TEXT_COLORS.map(({ label, color }) => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  className="w-6 h-6 rounded-full border border-zinc-200 flex-shrink-0 cursor-pointer shadow-2xs hover:scale-105 transition-transform"
                  style={{ backgroundColor: color }}
                  title={label}
                />
              ))}
              <div className="relative w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 flex-shrink-0 overflow-hidden cursor-pointer" title="Custom color">
                <Palette size={13} className="pointer-events-none" />
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
                className="w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 flex-shrink-0 cursor-pointer"
                title="Reset Color"
              >
                <Eraser size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-zinc-200 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer ${
          editor.isActive('bold') ? 'bg-zinc-900 text-white hover:bg-black hover:text-white' : 'text-zinc-600'
        }`}
        title="Bold"
      >
        <Bold size={15} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer ${
          editor.isActive('italic') ? 'bg-zinc-900 text-white hover:bg-black hover:text-white' : 'text-zinc-600'
        }`}
        title="Italic"
      >
        <Italic size={15} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer ${
          editor.isActive('underline') ? 'bg-zinc-900 text-white hover:bg-black hover:text-white' : 'text-zinc-600'
        }`}
        title="Underline"
      >
        <UnderlineIcon size={15} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer ${
          editor.isActive('strike') ? 'bg-zinc-900 text-white hover:bg-black hover:text-white' : 'text-zinc-600'
        }`}
        title="Strikethrough"
      >
        <Strikethrough size={15} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer ${
          editor.isActive('code') ? 'bg-zinc-900 text-white hover:bg-black hover:text-white' : 'text-zinc-600'
        }`}
        title="Code"
      >
        <Code size={15} />
      </button>
    </BubbleMenu>
  )
}
