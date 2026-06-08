import React, { useRef, useEffect, useState } from 'react';
import { Send } from 'lucide-react';

const MAX_CHARS = 2000;

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * 4 + 24; // 4 rows + padding
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charsLeft = MAX_CHARS - value.length;
  const nearLimit = charsLeft < 200;

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-3 flex-shrink-0">
      <div className="flex items-end gap-3">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setValue(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
            disabled={disabled}
            rows={1}
            className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-slate-800 placeholder-slate-400 leading-relaxed outline-none transition-all duration-200 ${
              disabled
                ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                : 'bg-white border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
            }`}
            style={{ overflowY: 'auto' }}
          />
          {/* Character count */}
          {nearLimit && (
            <span
              className={`absolute bottom-2 right-3 text-[11px] font-medium ${
                charsLeft < 50 ? 'text-red-400' : 'text-amber-400'
              }`}
            >
              {charsLeft}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          title="Send message"
          className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm ${
            disabled || !value.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 hover:shadow-md active:scale-95'
          }`}
        >
          <Send size={17} />
        </button>
      </div>

      {/* Hint */}
      <p className="text-[11px] text-slate-400 mt-1.5 pl-0.5">
        Shift+Enter for new line
      </p>
    </div>
  );
}
