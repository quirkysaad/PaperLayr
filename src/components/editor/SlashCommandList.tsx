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
      className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.06)] border border-zinc-200/80 overflow-hidden p-1.5 w-76 max-h-80 overflow-y-auto"
    >
      {props.items.map((item: CommandItem, index: number) => (
        <button
          className={`w-full text-left px-2.5 py-2 flex items-center gap-3 rounded-xl transition-colors cursor-pointer ${
            index === selectedIndex ? 'bg-zinc-100' : 'hover:bg-zinc-50'
          }`}
          key={index}
          onClick={() => selectItem(index)}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200/80 bg-white text-zinc-600 shadow-2xs shrink-0">
            {item.icon}
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold text-zinc-900 tracking-tight">{item.title}</div>
            <div className="text-[11.5px] text-zinc-500 truncate">{item.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
});
