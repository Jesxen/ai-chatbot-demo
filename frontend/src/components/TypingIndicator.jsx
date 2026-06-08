import React from 'react';
import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="message-enter flex items-end gap-2.5">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
        <Bot size={15} className="text-white" />
      </div>

      {/* Bubble */}
      <div className="flex flex-col gap-1 items-start">
        <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="typing-dot w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <span className="typing-dot w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <span className="typing-dot w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          </div>
        </div>
        <span className="text-[11px] text-slate-400 px-1">Thinking...</span>
      </div>
    </div>
  );
}
