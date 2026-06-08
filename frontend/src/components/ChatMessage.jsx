import React from 'react';
import { Bot, User } from 'lucide-react';

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`message-enter flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isUser
            ? 'bg-indigo-600'
            : 'bg-gradient-to-br from-indigo-500 to-violet-600'
        }`}
      >
        {isUser ? (
          <User size={15} className="text-white" />
        ) : (
          <Bot size={15} className="text-white" />
        )}
      </div>

      {/* Bubble + timestamp */}
      <div
        className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[65%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm'
              : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
          }`}
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {message.content}
        </div>

        <span className="text-[11px] text-slate-400 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
