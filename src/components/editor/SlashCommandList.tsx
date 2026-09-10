import React, { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (props: any) => void;
}

export const SlashCommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      item.command({ editor: props.editor, range: props.range });
    }
  };

  const upHandler = () => {
    setSelectedIndex((prev) => (prev + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((prev) => (prev + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  if (!props.items.length) {
    return null;
  }

  return (
    <div 
      ref={scrollContainerRef}
      className="bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden py-1.5 w-72 max-h-80 overflow-y-auto"
    >
      {props.items.map((item: CommandItem, index: number) => (
        <button
          className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
            index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
          }`}
          key={index}
          onClick={() => selectItem(index)}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white text-gray-500 shadow-sm">
            {item.icon}
          </div>
          <div>
            <div className="text-[14px] font-medium text-gray-900">{item.title}</div>
            <div className="text-[12px] text-gray-500">{item.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
});
