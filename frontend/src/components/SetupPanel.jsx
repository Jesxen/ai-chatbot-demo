import React, { useState, useRef } from 'react';
import { Bot, Upload, FileText, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function SetupPanel({ onSetupComplete }) {
  const [businessName, setBusinessName] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['txt', 'pdf'].includes(ext)) {
      setError('Only .txt and .pdf files are supported.');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!businessName.trim()) {
      setError('Please enter your business name.');
      return;
    }
    if (!file) {
      setError('Please select a knowledge base .txt file.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('knowledge', file);
      formData.append('businessName', businessName.trim());

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch {
        throw new Error('Cannot reach server. Is the backend running on port 3001?');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed. Please try again.');
      }

      onSetupComplete({
        businessName: businessName.trim(),
        extractedText: data.extractedText || '',
        fileName: data.fileName,
        charCount: data.charCount,
        suggestedQuestions: data.suggestedQuestions || [],
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl mb-4">
            <Bot size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">AI Assistant Setup</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your business chatbot</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Business Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="businessName">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Acme Corp"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Knowledge Base Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Knowledge Base
              </label>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? 'border-indigo-400 bg-indigo-50'
                    : file
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                } ${isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                  disabled={isLoading}
                />

                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <FileText size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">{file.name}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB · click to change
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Upload size={20} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Drop your file here, or{' '}
                        <span className="text-indigo-600 font-semibold">browse</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Supported formats: .txt and .pdf</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Upload a .txt or .pdf with your business info: FAQs, hours, services, pricing, and more.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 shadow-md ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Launch Chatbot
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Powered by Jesxen · For small business demos
        </p>
      </div>
    </div>
  );
}
