import { StructuredPlan } from './types';

export interface SafetyCheckResult {
  isUnsafe: boolean;
  category?: 'self_harm' | 'abuse' | 'medical_emergency' | 'general_crisis';
  reason?: string;
  plan?: StructuredPlan;
}

// Emergency contact numbers across key regions (including UAE for Vishesh / Vibbber)
export const EMERGENCY_CONTACTS = [
  { region: '🇦🇪 UAE / Dubai', numbers: 'Police: 999 | Ambulance: 998 | Child Protection: 800988 (EWAA)' },
  { region: '🇺🇸 United States', numbers: 'Suicide & Crisis Lifeline: 988 | Emergency: 911 | Child Abuse: 1-800-422-4453' },
  { region: '🇬🇧 United Kingdom', numbers: 'Emergency: 999 | Childline: 0800 1111 | NHS Medical: 111' },
  { region: '🇵🇰 Pakistan', numbers: 'Rescue: 1122 | Child Protection Helpline: 1121 | Police: 15' },
  { region: '🇮🇳 India', numbers: 'Emergency: 112 | Childline: 1098 | Ambulance: 102' },
  { region: '🌐 International', numbers: 'Find your local hotline at www.findahelpline.com or www.befrienders.org' },
];

// Detect if text is written in Arabic/Perso-Arabic script (Urdu)
export function isUrduScript(text: string): boolean {
  const urduRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return urduRegex.test(text);
}

// Simple heuristic for Roman Urdu vs English
export function detectLanguage(text: string): 'en' | 'ur' | 'roman_ur' {
  if (isUrduScript(text)) {
    return 'ur';
  }
  
  const romanUrduTokens = [
    'mera', 'meri', 'mere', 'bacha', 'bache', 'bachi', 'karta', 'karti', 'karte',
    'nahi', 'bohat', 'bohot', 'khana', 'khata', 'sona', 'raat', 'subah', 'tang',
    'chota', 'choti', 'bada', 'badi', 'kya', 'kyun', 'kaise', 'hum', 'aap', 'karein',
    'btao', 'batayein', 'zikr', 'zidd', 'ziddi', 'chikh', 'shor', 'rota', 'roti'
  ];
  
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const matches = words.filter(w => romanUrduTokens.includes(w));
  
  if (matches.length >= 2 || (words.length < 5 && matches.length >= 1)) {
    return 'roman_ur';
  }
  
  return 'en';
}

// Safety keywords & semantic triggers
const CRISIS_PATTERNS = {
  self_harm: [
    // English
    /\b(kill (myself|himself|herself|themselves))\b/i,
    /\b(suicid(e|al))\b/i,
    /\b(want(s)? to die)\b/i,
    /\b(end (my|his|her|their) life)\b/i,
    /\b(cut(ting)? (myself|himself|herself|wrist|wrists))\b/i,
    /\b(hang(ing)? (myself|himself|herself))\b/i,
    /\b(hurt(ing)? (myself|himself|herself) (on purpose|deliberately))\b/i,
    /\b(take (my|his|her) own life)\b/i,
    // Urdu Script
    /خودکشی/,
    /جان سے مار/,
    /مرنا چاہتا/,
    /مرنا چاہتی/,
    /اپنے آپ کو نقصان/,
    /زندگی ختم/,
    // Roman Urdu
    /\b(khudkushi|jaan se maar|marna chahta|marna chahti|apnay aap ko nuqsan|zindagi khatam)\b/i,
  ],
  abuse: [
    // English
    /\b(beat(ing)? (my|the|a) child (severely|badly|with a belt|violently))\b/i,
    /\b(bruis(es|ed) from (hitting|beating))\b/i,
    /\b(sexual(ly)? (abus(e|ed)|assault|touched|molest))\b/i,
    /\b(physical(ly)? abus(e|ed))\b/i,
    /\b(burn(ed|ing)? (my|the) child)\b/i,
    /\b(lock(ed)? in a (closet|dark room) for days)\b/i,
    /\b(touching (privates|inappropriately))\b/i,
    // Urdu Script
    /جنسی زیادتی/,
    /جسمانی تشدد/,
    /مار پیٹ/,
    /بچے پر تشدد/,
    /بے رحمی سے مار/,
    /غلط طریقے سے چھوا/,
    // Roman Urdu
    /\b(tashaddud|maar peet|jinsi ziyadti|bache ko marna|belt se mara|jism par nishan|ghalat tareeqay se chhua)\b/i,
  ],
  medical_emergency: [
    // English
    /\b(drank|ingested|swallowed) (bleach|poison|chemicals|pills|battery|cleaner|detergent)\b/i,
    /\b(unconscious|not breathing|stopped breathing|blue lips|choking on)\b/i,
    /\b(severe bleeding|seizure(s)? lasting|passed out cold)\b/i,
    /\b(head injury|skull fracture|unresponsive)\b/i,
    // Urdu Script
    /زہر پی لیا/,
    /کیمیکل پی لیا/,
    /سانس نہیں لے رہا/,
    /بے ہوش ہو گیا/,
    /دم گھٹ رہا ہے/,
    /خون بہہ رہا ہے/,
    // Roman Urdu
    /\b(zehar pee liya|chemical pee liya|sans nahi le raha|behosh ho gaya|dam ghut raha|khoon beh raha)\b/i,
  ],
};

/**
 * Deterministic safety classifier.
 * Catches any acute safety / crisis situations reliably before or alongside LLM.
 */
export function checkSafety(userInput: string): SafetyCheckResult {
  const text = userInput.trim();
  const lang = detectLanguage(text);

  // Check self-harm
  for (const pattern of CRISIS_PATTERNS.self_harm) {
    if (pattern.test(text)) {
      return {
        isUnsafe: true,
        category: 'self_harm',
        reason: 'Detected explicit thoughts, statements, or risks of self-harm or suicide.',
        plan: buildEscalationPlan('self_harm', lang),
      };
    }
  }

  // Check abuse
  for (const pattern of CRISIS_PATTERNS.abuse) {
    if (pattern.test(text)) {
      return {
        isUnsafe: true,
        category: 'abuse',
        reason: 'Detected description of physical, sexual, or severe child abuse/neglect.',
        plan: buildEscalationPlan('abuse', lang),
      };
    }
  }

  // Check medical emergency
  for (const pattern of CRISIS_PATTERNS.medical_emergency) {
    if (pattern.test(text)) {
      return {
        isUnsafe: true,
        category: 'medical_emergency',
        reason: 'Detected acute medical crisis or ingestion of toxic substances requiring immediate emergency room care.',
        plan: buildEscalationPlan('medical_emergency', lang),
      };
    }
  }

  return { isUnsafe: false };
}

/**
 * Constructs an empathetic, uncompromising escalation plan
 * with direct regional crisis contact details.
 */
export function buildEscalationPlan(
  category: 'self_harm' | 'abuse' | 'medical_emergency' | 'general_crisis',
  lang: 'en' | 'ur' | 'roman_ur'
): StructuredPlan {
  if (lang === 'ur') {
    return {
      isEscalation: true,
      language: 'ur',
      empathyNote:
        'یہ صورتحال فوری توجہ اور فوری مدد کی متقاضی ہے۔ میں ایک اے آئی پیرنٹنگ کوچ ہوں اور ہنگامی حالات، خود کو نقصان پہنچانے، یا طبی خطرات میں مشاورت فراہم نہیں کر سکتا۔ آپ کے بچے اور آپ کی حفاظت سب سے اہم ہے۔',
      actionPlan: [
        'فوری طور پر مقامی ایمرجنسی سروسز (UAE: 998/999 | پاکستان: 1122/1121) سے رابطہ کریں یا قریبی ہسپتال پہنچیں۔',
        'بچے کو اکیلا مت چھوڑیں؛ فوری طور پر تمام خطرناک یا نقصان دہ اشیاء ہٹا دیں اور اسے ایک محفوظ جگہ پر رکھیں۔',
        'اگر معاملہ ادویات یا زہر کا ہے تو پروڈکٹ کا ڈبہ اپنے ساتھ رکھیں، اور زبردستی الٹی کروانے سے گریز کریں۔',
      ],
      checkIn:
        'براہ کرم سب سے پہلے پروفیشنل ایمرجنسی خدمات سے رابطہ کریں۔ جب آپ اور آپ کا بچہ بالکل محفوظ ہوں، تب بتائیے گا۔',
      escalationDetails: {
        emergencyType: category,
        urgentMessage: '⚠️ فوری ہنگامی مدد درکار ہے - براہ کرم فوری ایمرجنسی نمبرز پر کال کریں',
        helplines: EMERGENCY_CONTACTS,
      },
      disclaimer: 'اہم تنبیہ: اے آئی کوچ ہنگامی طبی، قانونی یا تشخیصی مشاورت کا متبادل نہیں ہے۔',
    };
  }

  if (lang === 'roman_ur') {
    return {
      isEscalation: true,
      language: 'roman_ur',
      empathyNote:
        'Yeh mamla bohat sanjeeda hai aur fori madad ka mutaqazi hai. Main aik AI parenting coach hoon aur emergency, khudkushi/self-harm, ya medical khatray me coaching nahi de sakta. Aapki aur bache ki hifazat sab se pehli tarjeeh hai.',
      actionPlan: [
        'Foran local emergency services (UAE: 998/999 | Pakistan: 1122 | India: 112) ko call karein ya qareebi hospital le jayein.',
        'Bache ko akela mat chhorein; kisi bhi khatarnak cheez ko door karein aur bache ko pur-sukoon mehfooz jagah par rakhein.',
        'Professional doctors ya crisis counsellors se fori rabta karein taake sahi tibbi o hifazati madad mil sakay.',
      ],
      checkIn:
        'Pehlay barah-e-karam emergency help call karein. Jab aap aur bacha mehfooz hon, tab check-in karein.',
      escalationDetails: {
        emergencyType: category,
        urgentMessage: '⚠️ Urgent Emergency Help Required - Please call emergency numbers immediately',
        helplines: EMERGENCY_CONTACTS,
      },
      disclaimer: 'Notice: AI coach cannot provide medical, diagnostic, or legal instructions in a crisis.',
    };
  }

  // English default
  return {
    isEscalation: true,
    language: 'en',
    empathyNote:
      "I hear how serious and urgent this is, but because this involves an immediate crisis or potential harm, I cannot provide routine parenting coaching. Your child's and family's immediate physical safety is the only priority right now.",
    actionPlan: [
      'Call emergency services right away (UAE: 998/999 | US: 911 or 988 Lifeline | UK: 999 | India: 112).',
      'Stay physically present with your child. Keep them in a calm, secure space and remove any hazardous objects or substances.',
      'Do not wait or attempt to handle acute medical trauma, suspected abuse, or self-harm alone—connect with on-duty emergency professionals.',
    ],
    checkIn:
      'Please seek urgent medical or crisis intervention first. Once you and your child are physically safe with professionals, please check back.',
    escalationDetails: {
      emergencyType: category,
      urgentMessage: '⚠️ Immediate Professional Escalation Required — Do Not Rely on AI for Emergencies',
      helplines: EMERGENCY_CONTACTS,
    },
    disclaimer:
      'Safety Guardrail Notice: This AI parenting coach does not diagnose, provide medical or legal instructions, or handle emergencies.',
  };
}
