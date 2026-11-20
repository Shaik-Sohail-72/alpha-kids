import React from 'react';
import { User, Sparkles, CheckCircle2, Clock, AlertCircle, Heart } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { CrisisBanner } from './CrisisBanner';
import { isUrduScript } from '@/lib/safetyGuardrails';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const plan = message.structuredPlan;
  const isUrdu = isUrduScript(message.content) || plan?.language === 'ur';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fade-in">
        <div
          dir={isUrdu ? 'rtl' : 'ltr'}
          className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-br-sm px-4 py-3 bg-stone-900 text-stone-50 shadow-md"
        >
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-medium text-stone-300">
            <User className="w-3 h-3 text-stone-400" />
            <span>Parent</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant / Coach Message
  if (message.isEscalation || plan?.isEscalation) {
    return (
      <div className="flex justify-start mb-6 animate-fade-in w-full">
        <div className="w-full max-w-2xl">
          {plan ? (
            <CrisisBanner plan={plan} />
          ) : (
            <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-red-900 text-sm">
              {message.content}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6 animate-fade-in w-full">
      <div
        dir={isUrdu ? 'rtl' : 'ltr'}
        className="w-full max-w-2xl rounded-2xl bg-white border border-stone-200/90 shadow-sm p-5 text-stone-800 transition-all hover:shadow-md"
      >
        {/* Header Badge */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-coral-500 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-stone-900 tracking-wide">
              {isUrdu ? 'پیرنٹنگ کوچ کا تجویز کردہ لائحہ عمل' : 'Structured Action Plan'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            {isUrdu ? 'محفوظ رہنمائی' : 'Safe Guidance'}
          </span>
        </div>

        {plan ? (
          <div className="space-y-4">
            {/* 1. Empathy & Understanding */}
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/70 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div className="flex items-center gap-1.5 text-stone-900 font-semibold mb-1 text-xs">
                <Heart className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span>{isUrdu ? 'ہمدردانہ جائزہ' : 'Understanding & Empathy'}</span>
              </div>
              <p>{plan.empathyNote}</p>
            </div>

            {/* 2. Concrete Action Plan */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 mb-2 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? 'عملی اقدامات' : 'Action Steps'}</span>
              </div>
              <div className="space-y-2">
                {plan.actionPlan.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100 text-xs sm:text-sm text-stone-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Follow-up Check-in */}
            <div className="bg-coral-50/70 rounded-xl p-3 border border-coral-200 text-xs sm:text-sm text-coral-950 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-coral-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-coral-900">
                  {isUrdu ? 'فالو اپ جائزہ:' : 'Follow-up Check-in:'}{' '}
                </span>
                <span className="text-stone-800">{plan.checkIn}</span>
              </div>
            </div>

            {/* 4. Safety Guardrail Disclaimer */}
            <div className="pt-2 text-[11px] text-stone-400 flex items-center gap-1.5 border-t border-stone-100">
              <AlertCircle className="w-3 h-3 text-stone-400 flex-shrink-0" />
              <span className="italic">{plan.disclaimer}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-700 whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
};
