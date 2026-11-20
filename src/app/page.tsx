'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { ChatInterface } from '@/components/ChatInterface';
import { SettingsModal } from '@/components/SettingsModal';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'mock'>('mock');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const clearSessionRef = useRef<(() => void) | null>(null);

  // Load saved settings from localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('vibbber_coach_api_key');
      const savedProvider = localStorage.getItem('vibbber_coach_provider') as
        | 'openai'
        | 'gemini'
        | 'mock';

      if (savedKey) setApiKey(savedKey);
      if (savedProvider) setProvider(savedProvider);
    } catch (e) {
      console.warn('Could not read settings from localStorage:', e);
    }
  }, []);

  const handleSaveSettings = (settings: {
    apiKey: string;
    provider: 'openai' | 'gemini' | 'mock';
  }) => {
    setApiKey(settings.apiKey);
    setProvider(settings.provider);
    try {
      localStorage.setItem('vibbber_coach_api_key', settings.apiKey);
      localStorage.setItem('vibbber_coach_provider', settings.provider);
    } catch (e) {
      console.warn('Could not save settings to localStorage:', e);
    }
  };

  const handleClearChat = () => {
    if (clearSessionRef.current) {
      clearSessionRef.current();
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col font-sans">
      <Header
        onClearChat={handleClearChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSimulatedMode={provider === 'mock'}
      />

      <ChatInterface
        apiKey={apiKey}
        provider={provider}
        onClearSessionTrigger={(clearFn) => {
          clearSessionRef.current = clearFn;
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        provider={provider}
        onSave={handleSaveSettings}
      />
    </main>
  );
}
