import React, { useState } from 'react';
import { X, Key, Cpu, ShieldCheck, Check, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  provider: 'openai' | 'gemini' | 'mock';
  onSave: (settings: { apiKey: string; provider: 'openai' | 'gemini' | 'mock' }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey: initialKey,
  provider: initialProvider,
  onSave,
}) => {
  const [key, setKey] = useState(initialKey);
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'mock'>(initialProvider);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!key.trim()) {
      setTestResult({ valid: false, message: 'Please enter an API key first to test.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: key.trim() }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        valid: false,
        message: err?.message || 'Failed to connect to verification server.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ apiKey: key.trim(), provider });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-coral-600" />
            <h3 className="font-bold text-stone-900 text-sm">Coach Engine & API Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Provider Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setProvider('mock');
                  setTestResult(null);
                }}
                className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                  provider === 'mock'
                    ? 'border-coral-500 bg-coral-50/50 text-coral-950 font-semibold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <Cpu className="w-4 h-4 mx-auto mb-1 text-coral-500" />
                Demo / Mock
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('openai');
                  setTestResult(null);
                }}
                className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                  provider === 'openai'
                    ? 'border-coral-500 bg-coral-50/50 text-coral-950 font-semibold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <span className="block text-sm font-bold text-coral-600 mb-0.5">GPT</span>
                OpenAI API
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('gemini');
                  setTestResult(null);
                }}
                className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                  provider === 'gemini'
                    ? 'border-coral-500 bg-coral-50/50 text-coral-950 font-semibold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <span className="block text-sm font-bold text-coral-600 mb-0.5">✦</span>
                Gemini API
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
              {provider === 'mock'
                ? 'Simulated Intelligent Engine works immediately with zero setup! Ideal for rapid testing without any API key.'
                : 'Connect live LLM via API key or test the key below.'}
            </p>
          </div>

          {provider !== 'mock' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-700">
                  {provider === 'openai' ? 'OpenAI API Key' : 'Google Gemini API Key'}
                </label>
                {provider === 'gemini' && (
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-coral-600 hover:text-coral-700 font-semibold underline"
                  >
                    Get Free Gemini Key ↗
                  </a>
                )}
              </div>

              {/* Input with inline Test Button */}
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder={provider === 'openai' ? 'sk-...' : 'AIzaSy...'}
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setTestResult(null);
                  }}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 font-mono"
                />
                <button
                  type="button"
                  disabled={!key.trim() || isTesting}
                  onClick={handleTestKey}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-800 disabled:opacity-40 transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-coral-600" /> Testing...
                    </>
                  ) : (
                    'Test Key'
                  )}
                </button>
              </div>

              {/* Test Result Message Badge */}
              {testResult && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in ${
                    testResult.valid
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {testResult.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug font-medium">{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span>Stored locally in browser memory.</span>
                <button
                  type="button"
                  onClick={() => {
                    setProvider('mock');
                    setKey('');
                    setTestResult(null);
                  }}
                  className="text-stone-700 font-medium hover:text-coral-600 underline"
                >
                  Switch to Free Demo Mode
                </button>
              </div>
            </div>
          )}

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              Deterministic crisis guardrails and non-diagnostic boundaries are always strictly enforced regardless of model choice.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
