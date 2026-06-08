import React, { useState, useRef, useEffect } from 'react';
import { Bot, RefreshCw, Volume2, VolumeX, Download, FileText, File } from 'lucide-react';

export default function Header({
  businessName,
  onReset,
  soundEnabled,
  onToggleSound,
  onExportTxt,
  onExportPdf,
  hasMessages,
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-900 px-4 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
      {/* Left: avatar + business info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
            <Bot size={20} className="text-white" />
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm leading-tight">{businessName}</span>
          <span className="text-slate-400 text-xs flex items-center gap-1">
            AI Assistant
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-indigo-500/30 ml-1">
              Powered by Jesxen
            </span>
          </span>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1.5">
        {/* Online indicator */}
        <div className="hidden sm:flex items-center gap-1.5 mr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 text-xs font-medium">Online</span>
        </div>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors duration-200"
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        {/* Export dropdown */}
        {hasMessages && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExportOpen((o) => !o)}
              title="Export chat"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors duration-200 px-2.5 py-1.5 rounded-lg text-xs font-medium"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export</span>
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <button
                  onClick={() => { onExportTxt(); setExportOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <FileText size={14} className="text-indigo-400" />
                  Download .txt
                </button>
                <button
                  onClick={() => { onExportPdf(); setExportOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-t border-slate-100"
                >
                  <File size={14} className="text-violet-400" />
                  Download .pdf
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset — go back to setup"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors duration-200 px-2.5 py-1.5 rounded-lg text-xs font-medium"
        >
          <RefreshCw size={13} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
}
