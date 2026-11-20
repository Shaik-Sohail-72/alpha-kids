import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, Heart } from 'lucide-react';
import { StructuredPlan } from '@/lib/types';
import { EMERGENCY_CONTACTS } from '@/lib/safetyGuardrails';

interface CrisisBannerProps {
  plan: StructuredPlan;
}

export const CrisisBanner: React.FC<CrisisBannerProps> = ({ plan }) => {
  const isUrdu = plan.language === 'ur';

  return (
    <div
      dir={isUrdu ? 'rtl' : 'ltr'}
      className="w-full my-3 p-5 rounded-2xl bg-gradient-to-br from-rose-50 via-red-50 to-amber-50 border-2 border-red-300 shadow-md text-stone-900"
    >
      {/* Header Badge */}
      <div className="flex items-center gap-2 mb-3 text-red-700 font-bold text-sm tracking-wide">
        <AlertOctagon className="w-5 h-5 text-red-600 animate-pulse flex-shrink-0" />
        <span>{plan.escalationDetails?.urgentMessage || 'IMMEDIATE SAFETY ESCALATION'}</span>
      </div>

      {/* Empathy & Urgent Guidance */}
      <p className="text-sm font-medium text-red-950 mb-4 leading-relaxed bg-white/70 p-3 rounded-xl border border-red-200">
        {plan.empathyNote}
      </p>

      {/* Urgent Action Steps */}
      <div className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          {isUrdu ? 'فوری اقدامات' : 'Critical Immediate Steps'}
        </h4>
        <div className="space-y-2">
          {plan.actionPlan.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 bg-white/90 p-2.5 rounded-lg border border-red-200/80 text-xs text-stone-800 font-medium"
            >
              <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                {idx + 1}
              </span>
              <span className="leading-snug">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Helplines Directory */}
      <div className="bg-red-900/95 text-white p-4 rounded-xl shadow-inner mt-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-red-200 mb-2.5">
          <PhoneCall className="w-4 h-4 text-red-400" />
          <span>{isUrdu ? 'براہ راست ایمرجنسی ہیلپ لائنز' : 'Emergency & Crisis Helplines'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {EMERGENCY_CONTACTS.map((item, i) => (
            <div
              key={i}
              className="bg-red-950/80 p-2 rounded-lg border border-red-800/60 flex flex-col justify-center"
            >
              <span className="font-semibold text-amber-300">{item.region}</span>
              <span className="text-stone-200 font-mono text-[10.5px] mt-0.5">{item.numbers}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Check-in Message */}
      <div className="mt-4 p-3 bg-amber-100/80 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2">
        <Heart className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">{isUrdu ? 'اگلا قدم:' : 'Next Check-in:'} </span>
          <span>{plan.checkIn}</span>
        </div>
      </div>
    </div>
  );
};
