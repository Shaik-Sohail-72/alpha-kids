'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, AlertCircle, Globe } from 'lucide-react';
import { ChatMessage as ChatMessageType, StructuredPlan } from '@/lib/types';
import { ChatMessage } from './ChatMessage';
import { PresetPrompts } from './PresetPrompts';
import { isUrduScript } from '@/lib/safetyGuardrails';

interface ChatInterfaceProps {
  apiKey: string;
  provider: 'openai' | 'gemini' | 'mock';
  onClearSessionTrigger?: (clearFn: () => void) => void;
  onOpenSettings?: () => void;
}

const INITIAL_WELCOME_PLAN: StructuredPlan = {
  empathyNote:
    "Hello and welcome! I am your AI Parenting Coach at Vibbber (Alpha Kids). Whether you are navigating tantrums, bedtime resistance, screen time, or daily parenting stress, I am here to offer brief, calm, and practical plans.",
  actionPlan: [
    "Share any parenting challenge in English, Urdu (اردو), or Roman Urdu.",
    "Receive a short 3-step action plan designed for real-world parenting routines.",
    "Follow a clear check-in time or question to reflect on what worked."
  ],
  checkIn:
    "What is the most pressing challenge you are facing with your child today?",
  isEscalation: false,
  language: 'en',
  disclaimer:
    "Safety Notice: I provide practical behavioral coaching. I do not provide medical or legal advice, nor do I diagnose conditions such as ADHD or Autism. For emergencies or abuse, I immediately escalate to crisis resources.",
};

const STORAGE_KEY = 'vibbber_coach_history_v1';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  apiKey,
  provider,
  onClearSessionTrigger,
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; isKeyError: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize or restore conversation history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read history from localStorage:', e);
    }

    // Default welcome message
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: INITIAL_WELCOME_PLAN.empathyNote,
        timestamp: Date.now(),
        structuredPlan: INITIAL_WELCOME_PLAN,
      },
    ]);
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.warn('Could not save history to localStorage:', e);
      }
    }
  }, [messages]);

  // Clear session handler
  const handleClearSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: INITIAL_WELCOME_PLAN.empathyNote,
        timestamp: Date.now(),
        structuredPlan: INITIAL_WELCOME_PLAN,
      },
    ]);
    setInput('');
    setError(null);
  };

  // Expose clear function to parent Header
  useEffect(() => {
    if (onClearSessionTrigger) {
      onClearSessionTrigger(handleClearSession);
    }
  }, [onClearSessionTrigger]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle send message
  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setError(null);
    setInput('');

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          apiKey,
          provider,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const isKeyError = response.status === 401 || response.status === 429;
        const message = data?.error || `Server error (${response.status}). Please try again.`;
        setError({ message, isKeyError });
        return;
      }

      const data = await response.json();

      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        structuredPlan: data.structuredPlan,
        isEscalation: data.structuredPlan?.isEscalation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError({ message: err?.message || 'Failed to reach the server. Please try again.', isKeyError: false });
    } finally {
      setIsLoading(false);
      // Refocus textarea on desktop
      if (typeof window !== 'undefined' && window.innerWidth > 640) {
        textareaRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isInputUrdu = isUrduScript(input);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-4xl mx-auto w-full px-3 sm:px-6">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pt-4 pb-2 space-y-2">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start mb-6 animate-pulse">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-coral-500 animate-spin" />
              <div className="text-xs font-medium text-stone-600">
                Crafting a structured, safe parenting plan...
              </div>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-0.5">
                {error.isKeyError ? '🔑 API Key Error' : 'Error'}
              </p>
              <p>{error.message}</p>
              {error.isKeyError && (
                <button
                  onClick={onOpenSettings}
                  className="mt-1.5 underline font-semibold text-red-800 hover:text-red-900"
                >
                  Open Settings to fix your key →
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Prompts & Input Area */}
      <div className="pb-4 pt-2 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
        {/* Preset scenario prompt chips */}
        <PresetPrompts
          onSelectPrompt={(prompt) => {
            setInput(prompt);
            sendMessage(prompt);
          }}
          disabled={isLoading}
        />

        {/* Input box */}
        <div className="relative rounded-2xl bg-white border border-stone-300 shadow-md focus-within:border-coral-500 focus-within:ring-2 focus-within:ring-coral-500/20 transition-all">
          <textarea
            ref={textareaRef}
            rows={2}
            dir={isInputUrdu ? 'rtl' : 'ltr'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isInputUrdu
                ? 'اپنے بچے کے متعلق کوئی مسئلہ یا سوال یہاں لکھیے (مثلاً: کھانا، نیند، سکرین کا وقت)...'
                : 'Type your parenting concern in English or Urdu (e.g., bedtime struggles, tantrums)...'
            }
            className="w-full resize-none p-3.5 pr-20 text-sm text-stone-800 placeholder-stone-400 bg-transparent focus:outline-none rounded-2xl"
          />

          {/* Right Action Tools inside textarea */}
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
            {isInputUrdu && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-coral-50 text-coral-700 border border-coral-200 flex items-center gap-1">
                <Globe className="w-3 h-3" /> اردو
              </span>
            )}
            <button
              type="button"
              disabled={!input.trim() || isLoading}
              onClick={() => sendMessage()}
              className="p-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-stone-900 transition-all shadow-sm"
              title="Send Message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-stone-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="hidden sm:inline">
            Non-diagnostic parenting coach • Emergency & abuse escalation active
          </span>
        </div>
      </div>
    </div>
  );
};
