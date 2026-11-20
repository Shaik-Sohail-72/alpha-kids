import { MessageRole, StructuredPlan } from './types';
import { checkSafety, detectLanguage, isUrduScript } from './safetyGuardrails';
import { getSimulatedCoachResponse } from './mockCoachEngine';

/** Simple sleep utility for retry backoff */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getLanguageInstruction(lang: 'en' | 'ur' | 'roman_ur'): string {
  if (lang === 'ur') {
    return `CRITICAL LANGUAGE REQUIREMENT (STRICT & MANDATORY):
The parent wrote in URDU script (اردو). You MUST respond entirely in authentic URDU script (اردو).
- empathyNote MUST be 100% in Urdu script (e.g. "میں آپ کی پریشانی کو بخوبی سمجھ سکتا ہوں...")
- actionPlan items MUST ALL be 100% in Urdu script (e.g. ["پہلا قدم...", "دوسرا قدم...", "تیسرا قدم..."])
- checkIn MUST be 100% in Urdu script (e.g. "کیا آپ آج رات یہ طریقہ آزما کر کل بتائیں گے؟")
- disclaimer MUST be in Urdu script (e.g. "یہ ایک پیرنٹنگ کوچ کی رہنمائی ہے۔ یہ کوئی طبی یا تشخیصی مشورہ نہیں ہے۔")
ABSOLUTE PROHIBITION: DO NOT write a single word of English in empathyNote, actionPlan, checkIn, or disclaimer. Respond exclusively in Urdu (اردو).`;
  }
  if (lang === 'roman_ur') {
    return `CRITICAL LANGUAGE REQUIREMENT:
The parent wrote in ROMAN URDU.
You MUST write all fields in natural conversational Roman Urdu (e.g. "Main aapki pareshani samajh sakta hoon...").
DO NOT write in English.`;
  }
  return `LANGUAGE REQUIREMENT:
Respond in clear, empathetic English.`;
}

function getDefaultPlan(lang: 'en' | 'ur' | 'roman_ur', latestMessage: string): {
  empathyNote: string;
  actionPlan: string[];
  checkIn: string;
  disclaimer: string;
} {
  if (lang === 'ur') {
    // If a curated topic exists in mockCoachEngine, reuse its high-quality Urdu text
    const curated = getSimulatedCoachResponse(latestMessage);
    if (curated && curated.empathyNote && isUrduScript(curated.empathyNote)) {
      return {
        empathyNote: curated.empathyNote,
        actionPlan: curated.actionPlan,
        checkIn: curated.checkIn,
        disclaimer: curated.disclaimer || 'عملی رہنمائی برائے والدین۔ یہ کوئی طبی یا تشخیصی سروس نہیں ہے۔',
      };
    }
    return {
      empathyNote: 'میں آپ کی پریشانی کو بخوبی سمجھ سکتا ہوں۔ بچوں کی پرورش میں ایسے چیلنجز اکثر سامنے آتے ہیں، لیکن محبت اور مستقل مزاجی سے ان کا حل ممکن ہے۔',
      actionPlan: [
        'پہلے خود پرسکون ہوں اور بچے کے ساتھ پیار اور ہمدردی سے رابطہ قائم کریں۔',
        'بچے کو واضح، مختصر اور مثبت انداز میں سمجھائیں تاکہ وہ بغیر دباؤ کے بات سمجھ سکے۔',
        'جب بچہ مثبت ردعمل دکھائے تو فوراً اس کی حوصلہ افزائی اور تعریف کریں۔',
      ],
      checkIn: 'کیا آپ آج یہ طریقہ آزما کر کل مجھے اس کا نتیجہ بتا سکتے ہیں؟',
      disclaimer: 'عملی رہنمائی برائے والدین۔ یہ کوئی طبی یا تشخیصی مشورہ نہیں ہے۔',
    };
  }
  if (lang === 'roman_ur') {
    return {
      empathyNote: 'Main aapki pareshani samajh sakta hoon. Bachon ke sath aise masail aam hain, magar sabr aur narmi se inka behtareen hal nikala ja sakta hai.',
      actionPlan: [
        'Pehle khud pur-sukoon hon aur bache se pyaar se baat karein.',
        'Bache ko saaf, aasan aur positive hidayat dein taake wo dushwari mehsoos na kare.',
        'Jab bacha thora sa bhi cooperate kare to foran uski tareef karein.',
      ],
      checkIn: 'Aaj yeh tariqa aazmayein aur kal batayein ke bache ka response kaisa raha?',
      disclaimer: 'Practical parenting advice. Not medical or diagnostic guidance.',
    };
  }
  return {
    empathyNote: 'I understand completely. Parenting challenges can feel overwhelming, but small, consistent steps make a big difference.',
    actionPlan: [
      'Take a deep breath and connect with your child before setting the boundary.',
      'Use simple, concrete instructions (e.g., "In 5 minutes, we turn off the TV together").',
      'Praise cooperation immediately when they make even a small effort to listen.',
    ],
    checkIn: 'Try this today and let me know how it goes tomorrow!',
    disclaimer: 'AI parenting coach guidance. Not medical or diagnostic advice.',
  };
}

const SYSTEM_INSTRUCTIONS = `You are a compassionate, expert AI Parenting Coach for Vibbber (Alpha Kids).
Your goal is to support parents with brief, highly practical, and empathetic guidance in either English or Urdu (Urdu script or Roman Urdu).

CRITICAL BOUNDARIES & SAFETY RULES:
1. DO NOT DIAGNOSE: You are NOT a doctor, pediatrician, or psychologist. Never diagnose any developmental or psychological condition (e.g., ADHD, Autism, Sensory Processing Disorder, Anxiety, Depression). If asked about symptoms or diagnosis, explicitly state this limitation and offer behavioral support while recommending consultation with a licensed pediatrician.
2. NO MEDICAL OR LEGAL INSTRUCTIONS: Never prescribe medications, dosages, medical treatments, or legal counsel.
3. CLEAR ESCALATION: If the parent describes or implies an EMERGENCY, ABUSE (physical, sexual, emotional), SELF-HARM, or SUICIDAL IDEATION, set isEscalation to true immediately and provide urgent crisis direction.
4. KEEP REPLIES BRIEF & PRACTICAL: Parents are tired and busy. Provide no long essays or excessive bullet points.
5. LANGUAGE: Always respond in the language the parent used. If they write in Urdu script, reply in Urdu script. If Roman Urdu, reply in Roman Urdu. If English, reply in English.
6. STRUCTURED OUTPUT: Always return a valid JSON object with the following schema:
{
  "empathyNote": "1-2 sentences of warm, validating empathy",
  "actionPlan": ["Concise step 1", "Concise step 2", "Concise step 3 (optional)"],
  "checkIn": "A specific follow-up question or a specific time to come back (e.g. Try this tonight and check back tomorrow)",
  "isEscalation": false,
  "disclaimer": "Brief standard reminder that you are an AI coach and not providing medical/legal advice."
}
`;

export async function generateCoachResponse(
  messages: { role: MessageRole; content: string }[],
  customApiKey?: string,
  preferredProvider?: 'openai' | 'gemini' | 'mock',
  customModel?: string
): Promise<StructuredPlan> {
  const latestMessage = messages[messages.length - 1]?.content || '';

  // 1. First line of defense: deterministic safety check
  const safetyCheck = checkSafety(latestMessage);
  if (safetyCheck.isUnsafe && safetyCheck.plan) {
    return safetyCheck.plan;
  }

  // 2. Determine provider and credentials
  // customApiKey belongs ONLY to the selected provider
  const openaiKey = preferredProvider === 'openai'
    ? (customApiKey || process.env.OPENAI_API_KEY)
    : process.env.OPENAI_API_KEY;
  const geminiKey = preferredProvider === 'gemini'
    ? (customApiKey || process.env.GEMINI_API_KEY)
    : process.env.GEMINI_API_KEY;

  if (preferredProvider === 'mock' || (!openaiKey && !geminiKey)) {
    return getSimulatedCoachResponse(latestMessage);
  }

  // 3. Call OpenAI — throw on failure, never silently fall back
  if (preferredProvider === 'openai' && openaiKey) {
    return await callOpenAI(messages, openaiKey, customModel);
  }

  // 4. Call Gemini — throw on failure, never silently fall back
  if (preferredProvider === 'gemini' && geminiKey) {
    return await callGemini(messages, geminiKey, customModel);
  }

  // Fallback: no provider/key configured — use mock
  return getSimulatedCoachResponse(latestMessage);
}

async function callOpenAI(
  messages: { role: MessageRole; content: string }[],
  apiKey: string,
  model = 'gpt-4o-mini'
): Promise<StructuredPlan> {
  const latestMessage = messages[messages.length - 1]?.content || '';
  const lang = detectLanguage(latestMessage);
  const langInstruction = getLanguageInstruction(lang);
  const defaults = getDefaultPlan(lang, latestMessage);

  const formattedMessages = [
    { role: 'system', content: `${SYSTEM_INSTRUCTIONS}\n\n${langInstruction}` },
    ...messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  // Retry up to 2 times on 429 (transient rate limit / cold-start throttle)
  const MAX_RETRIES = 2;
  const RETRY_DELAY_MS = 1500;
  let res!: Response;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      console.warn(`[OpenAI] 429 rate limit — retrying in ${RETRY_DELAY_MS}ms (attempt ${attempt}/${MAX_RETRIES})...`);
      await sleep(RETRY_DELAY_MS * attempt);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: formattedMessages,
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 600,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status !== 429) break; // success or a non-retriable error — stop retrying
  }

  if (!res.ok) {
    const status = res.status;
    if (status === 401) throw new Error('API_KEY_INVALID: Your OpenAI API key is invalid or expired. Please check your key in Settings.');
    if (status === 429) throw new Error('API_KEY_QUOTA: Your OpenAI API key has exceeded its quota or rate limit. Please check your billing at platform.openai.com.');
    throw new Error(`OpenAI error (${status}): ${res.statusText}`);
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(rawText);

  const empathy = parsed.empathyNote || defaults.empathyNote;
  const action = Array.isArray(parsed.actionPlan) && parsed.actionPlan.length > 0 ? parsed.actionPlan : defaults.actionPlan;
  const check = parsed.checkIn || defaults.checkIn;
  const disc = parsed.disclaimer || defaults.disclaimer;

  // Language Verification: If user wrote in Urdu script, but LLM replied in English,
  // ensure we return a pure Urdu response so user never sees English in an Urdu card
  if (lang === 'ur' && !isUrduScript(empathy) && !isUrduScript(action[0] || '')) {
    console.warn('[LLM Provider] OpenAI replied in English for Urdu query. Using curated Urdu response.');
    return getSimulatedCoachResponse(latestMessage);
  }

  return {
    empathyNote: empathy,
    actionPlan: action,
    checkIn: check,
    isEscalation: Boolean(parsed.isEscalation),
    language: lang,
    disclaimer: disc,
  };
}

async function callGemini(
  messages: { role: MessageRole; content: string }[],
  apiKey: string,
  model = 'gemini-3.8-flash'
): Promise<StructuredPlan> {
  const latestMessage = messages[messages.length - 1]?.content || '';
  const lang = detectLanguage(latestMessage);
  const langInstruction = getLanguageInstruction(lang);
  const defaults = getDefaultPlan(lang, latestMessage);

  // Build clean conversational context
  const previousTurns = messages
    .slice(-5, -1)
    .map((m) => `${m.role === 'user' ? 'Parent' : 'Coach'}: ${m.content}`)
    .join('\n');

  const fullPrompt = `${SYSTEM_INSTRUCTIONS}

${langInstruction}

${previousTurns ? `PREVIOUS CONVERSATION:\n${previousTurns}\n\n` : ''}PARENT'S CURRENT MESSAGE:
"${latestMessage}"

CRITICAL: The parent wrote in ${lang === 'ur' ? 'URDU (اردو). You MUST write all fields (empathyNote, actionPlan, checkIn, disclaimer) entirely in authentic Urdu script (اردو).' : lang === 'roman_ur' ? 'ROMAN URDU. You MUST write all fields in Roman Urdu.' : 'ENGLISH.'}
Respond strictly with a single valid JSON object following the schema in the requested language.`;

  // 1. Try Google AI Studio's new Interactions API first (for gemini-3.8-flash / gemini-4-hydrogen)
  try {
    const controller = new AbortController();
    const tId = setTimeout(() => controller.abort(), 10000);

    const intRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3.8-flash',
          input: fullPrompt,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(tId);

    if (intRes.ok) {
      const intData = await intRes.json();
      const rawText =
        intData.output?.text ||
        intData.outputs?.[0]?.text ||
        intData.candidates?.[0]?.content?.parts?.[0]?.text ||
        JSON.stringify(intData);

      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || rawText.match(/({[\s\S]*})/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText;

      let parsed: any = {};
      try { parsed = JSON.parse(jsonStr.trim()); } catch { parsed = {}; }

      if (parsed.empathyNote || parsed.actionPlan) {
        const empathy = parsed.empathyNote || defaults.empathyNote;
        const action =
          Array.isArray(parsed.actionPlan) && parsed.actionPlan.length > 0
            ? parsed.actionPlan
            : defaults.actionPlan;
        const check = parsed.checkIn || defaults.checkIn;
        const disc = parsed.disclaimer || defaults.disclaimer;

        // Language Verification: If user wrote in Urdu script, but LLM replied in English,
        // fall back to our authentic Urdu coaching engine so user NEVER sees English in Urdu mode
        if (lang === 'ur' && !isUrduScript(empathy) && !isUrduScript(action[0] || '')) {
          console.warn('[LLM Provider] Interactions API replied in English for Urdu query. Using curated Urdu response.');
          return getSimulatedCoachResponse(latestMessage);
        }

        return {
          empathyNote: empathy,
          actionPlan: action,
          checkIn: check,
          isEscalation: Boolean(parsed.isEscalation),
          language: lang,
          disclaimer: disc,
        };
      }
    }
  } catch (e: any) {
    // Interactions API not supported or timed out, fall through to generateContent
  }

  // 2. Standard generateContent endpoint
  // Using active models from your AI Studio project dashboard (500 RPD)
  const modelsToTry = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemma-4-26b',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  for (const modelName of uniqueModels) {
    const cleanName = modelName.replace(/^models\//, '');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${apiKey}`;

    // Retry up to 2 times on 429 (Gemini free-tier cold-start throttle)
    const MAX_MODEL_RETRIES = 2;
    let res!: Response;
    let gotFetchError = false;

    try {
      for (let attempt = 0; attempt <= MAX_MODEL_RETRIES; attempt++) {
        if (attempt > 0) {
          console.warn(`[Gemini] 429 on ${cleanName} — retrying in ${1500 * attempt}ms (attempt ${attempt}/${MAX_MODEL_RETRIES})...`);
          await sleep(1500 * attempt);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 600,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.status !== 429) break; // Not a rate-limit — stop retrying
      }
    } catch (fetchErr: any) {
      gotFetchError = true;
      // Network/abort errors — skip to next model
    }

    try {
      if (gotFetchError) continue; // skip to next model on network error

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.error?.message || res.statusText || `HTTP ${res.status}`;

        if (res.status === 400 || res.status === 403) {
          throw new Error(`API_KEY_INVALID: ${errMsg}`);
        }
        if (res.status === 429) {
          throw new Error('API_KEY_QUOTA: Gemini free tier rate limit exceeded after retries. Please try again in a moment or switch to Demo mode.');
        }
        if (res.status === 404) {
          continue; // try next model
        }
        throw new Error(`Gemini API error (${res.status}): ${errMsg}`);
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || rawText.match(/({[\s\S]*})/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText;

      let parsed: any = {};
      try { parsed = JSON.parse(jsonStr.trim()); } catch { parsed = {}; }

      const empathy = parsed.empathyNote || defaults.empathyNote;
      const action =
        Array.isArray(parsed.actionPlan) && parsed.actionPlan.length > 0
          ? parsed.actionPlan
          : defaults.actionPlan;
      const check = parsed.checkIn || defaults.checkIn;
      const disc = parsed.disclaimer || defaults.disclaimer;

      // Language Verification: If user wrote in Urdu script, but LLM replied in English,
      // fall back to our authentic Urdu coaching engine so user NEVER sees English in Urdu mode
      if (lang === 'ur' && !isUrduScript(empathy) && !isUrduScript(action[0] || '')) {
        console.warn('[LLM Provider] Gemini replied in English for Urdu query. Using curated Urdu response.');
        return getSimulatedCoachResponse(latestMessage);
      }

      return {
        empathyNote: empathy,
        actionPlan: action,
        checkIn: check,
        isEscalation: Boolean(parsed.isEscalation),
        language: lang,
        disclaimer: disc,
      };
    } catch (err: any) {
      if (err.message?.startsWith('API_KEY_INVALID:') || err.message?.startsWith('API_KEY_QUOTA:')) {
        throw err;
      }
      // Other errors (network, abort, parse) — skip to next model
    }
  }

  throw new Error('Gemini API is currently unreachable or rate-limited on this key. Please switch to Demo / Mock mode in Settings for instant responses.');
}
