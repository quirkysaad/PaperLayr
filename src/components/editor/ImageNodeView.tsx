import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';

export const ImageNodeView = (props: NodeViewProps) => {
  const { src, align, width } = props.node.attrs;
  const [isHovered, setIsHovered] = useState(false);

  const setAlign = (alignment: string) => {
    props.updateAttributes({
      align: alignment,
    });
  };

  const setWidth = (newWidth: string) => {
    props.updateAttributes({
      width: newWidth,
    });
  };

  const deleteImage = () => {
    props.deleteNode();
  };

  const widthClass = 
    width === 'full' ? 'w-full' : 
    width === 'medium' ? 'w-1/2' : 
    width === 'small' ? 'w-1/4' : 
    'max-w-full';

  return (
    <NodeViewWrapper
      className={`relative flex group transition-all duration-200 ${
        align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative inline-block ${width === 'full' ? 'w-full' : 'max-w-full'}`}>
        <img
          src={src}
          alt="User attachment"
          className={`rounded-lg ${widthClass}`}
        />
        
        {/* Overlay */}
        <div 
          className={`absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm border border-gray-200 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Width Controls */}
          <button
            onClick={() => setWidth('small')}
            className={`px-1.5 py-1 rounded hover:bg-gray-100 text-gray-600 transition-colors text-xs font-medium ${width === 'small' ? 'bg-gray-200 text-gray-900' : ''}`}
            title="Small Width (25%)"
          >
            25%
          </button>
          <button
            onClick={() => setWidth('medium')}
            className={`px-1.5 py-1 rounded hover:bg-gray-100 text-gray-600 transition-colors text-xs font-medium ${width === 'medium' ? 'bg-gray-200 text-gray-900' : ''}`}
            title="Medium Width (50%)"
          >
            50%
          </button>
          <button
            onClick={() => setWidth('full')}
            className={`px-1.5 py-1 rounded hover:bg-gray-100 text-gray-600 transition-colors text-xs font-medium ${width === 'full' ? 'bg-gray-200 text-gray-900' : ''}`}
            title="Full Width (100%)"
          >
            100%
          </button>
          <button
            onClick={() => setWidth('original')}
            className={`px-1.5 py-1 rounded hover:bg-gray-100 text-gray-600 transition-colors text-xs font-medium ${width === 'original' || !width ? 'bg-gray-200 text-gray-900' : ''}`}
            title="Original Width"
          >
            Auto
          </button>
          
          <div className="w-px h-4 bg-gray-300 mx-1"></div>

          {/* Alignment Controls */}
          <button
            onClick={() => setAlign('left')}
            className={`p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors ${align === 'left' ? 'bg-gray-200 text-gray-900' : ''}`}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => setAlign('center')}
            className={`p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors ${align === 'center' ? 'bg-gray-200 text-gray-900' : ''}`}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => setAlign('right')}
            className={`p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors ${align === 'right' ? 'bg-gray-200 text-gray-900' : ''}`}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          
          {/* Delete Control */}
          <button
            onClick={deleteImage}
            className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
            title="Delete Image"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

