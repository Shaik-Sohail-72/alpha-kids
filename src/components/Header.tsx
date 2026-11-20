import React from 'react';
import { ShieldCheck, RotateCcw, Settings, Sparkles, HeartHandshake, PlayCircle } from 'lucide-react';

interface HeaderProps {
  onClearChat: () => void;
  onOpenSettings: () => void;
  isSimulatedMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onClearChat,
  onOpenSettings,
  isSimulatedMode,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-coral-500 via-rose-400 to-amber-300 flex items-center justify-center text-white shadow-md shadow-coral-500/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-stone-900 tracking-tight">
                Vibbber Coach
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-coral-100 text-coral-700">
                Alpha Kids
              </span>
              {isSimulatedMode && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Ready-to-Test Demo
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Brief, safe parenting guidance in English & Urdu (اردو)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* <a
            href="/demo_presentation.html"
            target="_blank"
            title="Watch 2-Minute Demo Video Walkthrough"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-coral-700 bg-coral-50 hover:bg-coral-100 rounded-lg border border-coral-200 transition-colors shadow-sm"
          >
            <PlayCircle className="w-4 h-4 text-coral-600" />
            <span className="hidden sm:inline">Demo Video</span>
          </a> */}

          <div className="hidden md:flex items-center text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>Guardrails Active</span>
          </div>

          <button
            onClick={onClearChat}
            title="Start New Conversation"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="API Settings"
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
