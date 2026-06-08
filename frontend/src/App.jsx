import React, { useState, useCallback, useEffect, useRef } from 'react';
import SetupPanel from './components/SetupPanel.jsx';
import Header from './components/Header.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import ChatInput from './components/ChatInput.jsx';
import { playMessageSound } from './utils/sound.js';
import { exportAsTxt, exportAsPdf } from './utils/exportChat.js';

function createMessage(role, content) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

export default function App() {
  const [knowledgeLoaded, setKnowledgeLoaded] = useState(false);
  const [businessName, setBusinessName] = useState('Your Business');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevMsgCount = useRef(0);

  // Play sound when new AI message arrives
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (
      messages.length > prevMsgCount.current &&
      lastMsg?.role === 'assistant' &&
      soundEnabled
    ) {
      playMessageSound();
    }
    prevMsgCount.current = messages.length;
  }, [messages, soundEnabled]);

  const handleSetupComplete = useCallback(({ businessName: biz, suggestedQuestions: sq }) => {
    setBusinessName(biz);
    setSuggestedQuestions(sq || []);
    setMessages([]);
    setKnowledgeLoaded(true);
  }, []);

  const handleReset = useCallback(() => {
    setKnowledgeLoaded(false);
    setMessages([]);
    setChatError('');
    setIsTyping(false);
    setSuggestedQuestions([]);
    prevMsgCount.current = 0;
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isTyping) return;
      setChatError('');

      const conversationHistory = messages.map((m) => ({ role: m.role, content: m.content }));
      const userMsg = createMessage('user', text.trim());
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.trim(), conversationHistory }),
        });

        const rawText = await res.text();
        let data;
        try { data = JSON.parse(rawText); } catch {
          throw new Error('Cannot reach server. Is the backend running on port 3001?');
        }

        if (!res.ok) throw new Error(data.error || 'Failed to get a response.');

        setMessages((prev) => [...prev, createMessage('assistant', data.reply)]);
      } catch (err) {
        setChatError(err.message || 'Something went wrong. Please try again.');
        setMessages((prev) => [
          ...prev,
          createMessage('assistant', `Sorry, I encountered an error: ${err.message || 'Please try again.'}`),
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isTyping]
  );

  const handleExportTxt = useCallback(() => exportAsTxt(messages, businessName), [messages, businessName]);
  const handleExportPdf = useCallback(() => exportAsPdf(messages, businessName), [messages, businessName]);

  if (!knowledgeLoaded) {
    return <SetupPanel onSetupComplete={handleSetupComplete} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Header
        businessName={businessName}
        onReset={handleReset}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
        onExportTxt={handleExportTxt}
        onExportPdf={handleExportPdf}
        hasMessages={messages.length > 0}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          onSendExample={sendMessage}
          suggestedQuestions={suggestedQuestions}
        />

        {chatError && (
          <div className="bg-red-50 border-t border-red-200 px-4 py-2 flex items-center justify-between">
            <p className="text-xs text-red-600">{chatError}</p>
            <button
              onClick={() => setChatError('')}
              className="text-red-400 hover:text-red-600 text-xs ml-3 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        <ChatInput onSend={sendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
