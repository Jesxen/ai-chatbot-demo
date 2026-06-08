import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import ChatMessage from './ChatMessage.jsx';
import TypingIndicator from './TypingIndicator.jsx';

const FALLBACK_QUESTIONS = [
  'What services do you offer?',
  'What are your business hours?',
  'How can I contact you?',
];

export default function ChatWindow({ messages, isTyping, onSendExample, suggestedQuestions }) {
  const bottomRef = useRef(null);
  const questions = suggestedQuestions?.length > 0 ? suggestedQuestions : FALLBACK_QUESTIONS;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto chat-scroll bg-slate-50">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center px-6 py-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg mb-5">
            <Bot size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2 text-center">
            How can I help you today?
          </h2>
          <p className="text-slate-500 text-sm text-center mb-8 max-w-xs leading-relaxed">
            Ask anything about this business. Answers come directly from what you uploaded.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-center">
            {questions.map((q) => (
              <button
                key={q}
                onClick={() => onSendExample(q)}
                className="px-4 py-2 rounded-full text-sm font-medium text-indigo-600 border border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-6 flex flex-col gap-5">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
