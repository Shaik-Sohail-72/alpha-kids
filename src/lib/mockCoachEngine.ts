import { StructuredPlan } from './types';
import { detectLanguage } from './safetyGuardrails';

interface TopicMatch {
  keywords: string[];
  planEn: StructuredPlan;
  planUr: StructuredPlan;
  planRomanUr: StructuredPlan;
}

const TOPIC_DATABASE: TopicMatch[] = [
  // 1. Tantrums & Emotional Regulation / Screen time
  {
    keywords: [
      'tantrum', 'meltdown', 'screaming', 'crying', 'tv', 'screen', 'ipad', 'phone', 'turn off', 'gadget',
      'سکرین', 'چیخنا', 'رونا', 'غصہ', 'ٹی وی', 'موبائل', 'فون', 'ضدی'
    ],
    planEn: {
      empathyNote:
        "Transitions away from high-dopamine screens are genuinely difficult for young nervous systems. You are not failing; your child's brain is simply overwhelmed by the sudden boundary.",
      actionPlan: [
        'Give a collaborative countdown: Use a visual or song-based 5-minute and 2-minute warning rather than abrupt cut-offs.',
        'Bridge the transition: Offer a tangible next activity right away (e.g., "Help me pick the dinner cups" or "Let us do 10 frog jumps to the kitchen").',
        'Hold the boundary with calm presence: Sit quietly near them while they express anger without arguing or pleading back.',
      ],
      checkIn:
        'Try the collaborative countdown during your next screen transition today, and check back tomorrow: did their emotional wave settle faster?',
      isEscalation: false,
      language: 'en',
      disclaimer: 'Practical parenting coaching. Not a medical or diagnostic service.',
    },
    planUr: {
      empathyNote:
        'سکرین بند کرنے یا پسندیدہ چیز ہٹانے پر بچوں کا غصہ دکھانا ایک عام ردعمل ہے۔ آپ تنہا نہیں ہیں، ان کا دماغ ابھی جذبات پر قابو پانا سیکھ رہا ہے۔',
      actionPlan: [
        'اچانک بند کرنے کے بجائے 5 اور 2 منٹ پہلے پیار سے اطلاع دیں تاکہ وہ ذہنی طور پر تیار ہو سکیں۔',
        'سکرین کے بعد اگلی دلچسپ سرگرمی پیش کریں (مثلاً: "آؤ مل کر پزل حل کریں" یا "کھانے کی میز سجائیں")۔',
        'غصے کی حالت میں بحث کرنے کے بجائے پرسکون انداز میں ان کے قریب رہیں اور انہیں محسوس کرائیں کہ آپ ساتھ ہیں۔',
      ],
      checkIn:
        'آج رات سکرین کے وقت یہ طریقہ اپنائیں اور کل بتائیے گا کہ کیا بچے کی ضد میں کوئی کمی آئی؟',
      isEscalation: false,
      language: 'ur',
      disclaimer: 'عملی رہنمائی برائے والدین۔ یہ کوئی طبی یا تشخیصی سروس نہیں ہے۔',
    },
    planRomanUr: {
      empathyNote:
        'Screen band karne par bache ka zidd ya ghussa karna aam baat hai. Is waqt unka dimagh fori tabdeeli ko bardasht karna seekh raha hota hai.',
      actionPlan: [
        'Screen achanak band karne ke bajaye 5 minute aur 2 minute pehlay pyaar se aagah karein.',
        'Screen ke baad foran koi doosri engaging activity dein (jaise snacks banana ya coloring).',
        'Tantrum ke dauran bahas na karein, pur-sukoon reh kar unke paas bethein aur boundary par qaim rahein.',
      ],
      checkIn:
        'Aaj shaam yeh tariqa aazmayein aur kal batayein: kya bache ne transition asani se ki?',
      isEscalation: false,
      language: 'roman_ur',
      disclaimer: 'Practical parenting advice. Not a diagnostic or medical service.',
    },
  },

  // 2. Picky Eating / Food Battles
  {
    keywords: [
      'eat', 'eating', 'food', 'picky', 'vegetable', 'khana', 'bhook', 'feed', 'refusing to eat',
      'کھانا', 'کھانے', 'نخرے', 'بھوک', 'غذا', 'سبزی', 'دودھ', 'روٹی'
    ],
    planEn: {
      empathyNote:
        'Mealtime battles can feel exhausting and worry any loving parent. Remember: your role is what and when to serve; your child decides how much to eat.',
      actionPlan: [
        'Serve a guaranteed safe food: Always place at least one item on the plate you know they tolerate alongside new or disliked food.',
        'Remove the pressure: Avoid bargaining ("take three more bites for dessert") which turns food into a power struggle.',
        'Involve them in food prep: Let them wash vegetables, stir, or set plates—familiarity builds appetite and lowers sensory defense.',
      ],
      checkIn:
        'Test the "safe food on the side" method at dinner tonight. How did their body language at the table change?',
      isEscalation: false,
      language: 'en',
      disclaimer: 'Practical parenting coaching. Consult a registered pediatric dietitian for clinical dietary concerns.',
    },
    planUr: {
      empathyNote:
        'کھانے کے معاملے میں بچوں کا نخرہ دکھانا والدین کے لیے پریشان کن ہوتا ہے، لیکن زبردستی کرنے سے کھانے کی ضد مزید بڑھ جاتی ہے۔',
      actionPlan: [
        'پلیٹ میں نئی چیز کے ساتھ کم از کم ایک ایسی غذا ضرور رکھیں جو وہ شوق سے کھاتے ہوں۔',
        'کھانا کھلانے کے دوران منتیں کرنے یا زبردستی کھلانے سے گریز کریں تاکہ کھانا تناؤ کا ذریعہ نہ بنے۔',
        'بچے کو کھانا تیار کرنے یا دسترخوان سجانے میں شامل کریں، اس سے کھانے میں ان کی دلچسپی بڑھتی ہے۔',
      ],
      checkIn:
        'آج کے کھانے پر یہ تینوں اقدامات آزمائیں اور کل بتائیے گا کہ بچے کا ردعمل کیسا رہا؟',
      isEscalation: false,
      language: 'ur',
      disclaimer: 'عملی رہنمائی برائے والدین۔ شدید غذائی کمی کی صورت میں ماہر اطفال سے رجوع کریں۔',
    },
    planRomanUr: {
      empathyNote:
        'Khane pe bache ki zidd waqai thaka dene wali hoti hai. Magar zabardasti khilana aksar maslay ko mazeed barha deta hai.',
      actionPlan: [
        'Plate me hamesha aik aisi cheez zaroor rakhein jo bacha pehlay se pasand karta ho.',
        'Zabardasti "aur do chamach khao" kehne se bachein taake khana jang ka maidan na bane.',
        'Bache ko kitchen me choti choti cheezon me shareek karein, is se unki bhook aur shauq barhta hai.',
      ],
      checkIn:
        'Aaj raat dinner me baghair dabao ke yeh try karein aur kal batayein bache ka rawaiyya kaisa tha?',
      isEscalation: false,
      language: 'roman_ur',
      disclaimer: 'Parenting coach guidelines. For medical nutritional concerns, consult a pediatrician.',
    },
  },

  // 3. Sleep & Bedtime Battles
  {
    keywords: [
      'sleep', 'bedtime', 'awake', 'night', 'wake up', 'so', 'sona', 'raat', 'neend',
      'سونا', 'سونے', 'نیند', 'رات', 'بستر', 'جاگنا', 'اندھیرا'
    ],
    planEn: {
      empathyNote:
        'Resisting bedtime is rarely about wanting to stay awake; it is often about separation anxiety or lingering sensory stimulation from the day.',
      actionPlan: [
        'Anchor a 20-minute wind-down ritual: Bath, dim lights, 2 short books, and calm breathing in the exact same sequence daily.',
        'Connection before separation: Spend 5 undistracted minutes talking or cuddling so their emotional tank feels full before lights out.',
        'Use an "I will check on you" promise: Tell them, "I will come back in 5 minutes to tuck your blanket." This relieves loneliness.',
      ],
      checkIn:
        'Try the 5-minute check-in promise tonight when putting them down. Did it reduce stalling?',
      isEscalation: false,
      language: 'en',
      disclaimer: 'Parenting coaching guidance. For chronic pediatric sleep disorders, seek medical evaluation.',
    },
    planUr: {
      empathyNote:
        'رات کو سونے میں تاخیر یا ضد کرنا عموماً دن بھر کی تھکن یا والدین سے علیحدگی کے خوف کی وجہ سے ہوتا ہے۔',
      actionPlan: [
        'سونے سے 30 منٹ قبل مدہم لائٹس اور ایک طے شدہ معمول (جیسے منہ ہاتھ دھونا اور کہانی سننا) اپنائیں۔',
        'سونے سے پہلے 5 منٹ بچے کے ساتھ پیار اور توجہ سے بات کریں تاکہ ان کا جذباتی سکون بحال ہو۔',
        'بچے کو یقین دلائیں کہ آپ 5 منٹ بعد دوبارہ جھانکنے آئیں گے؛ اس سے اکیلے پن کا ڈر دور ہوتا ہے۔',
      ],
      checkIn:
        'آج رات یہ نیا معمول آزمائیں اور کل صبح بتائیں کہ کیا وہ جلدی سو پائے؟',
      isEscalation: false,
      language: 'ur',
      disclaimer: 'والدین کے لیے عملی مشورہ۔ نیند کی دائمی طبی علامات کے لیے ڈاکٹر سے مشورہ لیں۔',
    },
    planRomanUr: {
      empathyNote:
        'Raat ko bache ka na sona parents ko thaka deta hai. Aksar bacha andheray ya akelay pan se ghabrata hai.',
      actionPlan: [
        'Sone se aadha ghanta pehlay lights dim karein aur aik routine banayein (kahani sunana ya lori).',
        'Sone se pehlay 5 minute baghair phone ke sirf bache se pyaar se baat karein.',
        'Bache se wada karein ke "main 5 minute baad tumhein check karne aaonga", is se unhe tasalli rehti hai.',
      ],
      checkIn:
        'Aaj raat yeh routine follow karein aur kal batayein kya bacha aram se soya?',
      isEscalation: false,
      language: 'roman_ur',
      disclaimer: 'Practical parenting advice. Not medical advice.',
    },
  },

  // 4. Focus, Hyperactivity & Medical Boundary (Non-diagnostic!)
  {
    keywords: [
      'adhd', 'autism', 'hyperactive', 'focus', 'concentrate', 'diagnose', 'sit still', 'attention',
      'توجہ', 'تشخیص', 'بیماری', 'ڈاکٹر', 'ایک جگہ', 'ہائپر', 'شور'
    ],
    planEn: {
      empathyNote:
        "High energy and short attention spans are common in developing children. As an AI parenting coach, I cannot provide a medical or neurodevelopmental diagnosis, but we can build structured routines that support their focus.",
      actionPlan: [
        'Chunk activities into micro-bursts: Set a visual sand timer for 7-10 minutes of focused activity followed by 3 minutes of physical movement.',
        'Heavy work before focus: Provide gross-motor movement (jumping jacks, carrying a heavy book, wall push-ups) to regulate their nervous system.',
        'Consult a qualified developmental pediatrician if sustained attention or sensory challenges interfere with school across multiple environments.',
      ],
      checkIn:
        'Introduce one 10-minute focus block with physical movement breaks today. Does this pacing help them stay engaged?',
      isEscalation: false,
      language: 'en',
      disclaimer:
        'Safety Notice: I am an AI coach, not a doctor or psychologist. I do not diagnose ADHD, Autism, or other conditions. Please consult a licensed pediatrician for diagnostic assessments.',
    },
    planUr: {
      empathyNote:
        'بچوں میں زیادہ توانائی اور ایک جگہ نہ بیٹھنا اکثر ان کے قدرتی نشوونما کے مرحلے کا حصہ ہوتا ہے۔ میں ایک اے آئی کوچ ہوں اور کسی طبی یا نفسیاتی بیماری (جیسے ADHD) کی تشخیص نہیں کر سکتا، تاہم توجہ بہتر بنانے کی عملی تجاویز پیش کر سکتا ہوں۔',
      actionPlan: [
        'کام کے دورانیے کو چھوٹا رکھیں: 7 سے 10 منٹ پڑھائی یا توجہ کے بعد 3 منٹ جسمانی حرکت (کودنا یا اسٹریچنگ) کا وقفہ دیں۔',
        'توجہ والے کام سے قبل جسمانی توانائی نکالنے والی سرگرمیاں کروائیں تاکہ جسم کا اعصابی نظام پرسکون ہو سکے۔',
        'اگر یہ مسئلہ ہر جگہ (اسکول اور گھر) مسلسل برقرار رہے تو کسی مستند چائلڈ سپیشلسٹ یا سائیکولوجسٹ سے باقاعدہ معائنہ کروائیں۔',
      ],
      checkIn:
        'آج 10 منٹ کے چھوٹے دورانیے کا تجربہ کریں اور بتائیں کہ کیا بچہ زیادہ دیر تک توجہ قائم رکھ سکا؟',
      isEscalation: false,
      language: 'ur',
      disclaimer:
        'اہم تنبیہ: اے آئی کوچ کسی بھی قسم کی طبی یا نفسیاتی تشخیص فراہم نہیں کرتا۔ باضابطہ جانچ کے لیے ماہر اطفال سے رجوع کریں۔',
    },
    planRomanUr: {
      empathyNote:
        'Bache me ziada energy hona aur ek jagah na baithna aksar normal hota hai. Main AI coach hoon aur koi medical diagnosis (jaise ADHD) nahi de sakta, lekin focus behtar karne ke tareeqay bata sakta hoon.',
      actionPlan: [
        'Study ya task ko chotay hisson me baantein: 8-10 minute kaam ke baad 3 minute physical movement break dein.',
        'Parhai se pehlay thori physical activity karwayein taake unka jism relax ho sake.',
        'Agar yeh masla regular ho to kisi qualified pediatrician ya child specialist se formal evaluation karwayein.',
      ],
      checkIn:
        'Chotay focus intervals try karein aur kal batayein kya farq mehsoos hua?',
      isEscalation: false,
      language: 'roman_ur',
      disclaimer: 'Safety notice: AI coach cannot diagnose ADHD or medical conditions. Consult a pediatrician.',
    },
  },
];

/**
 * Fallback intelligent engine when no external API key is provided
 * or when offline testing is desired.
 */
export function getSimulatedCoachResponse(userMessage: string): StructuredPlan {
  const lang = detectLanguage(userMessage);
  const lower = userMessage.toLowerCase();

  // Search topic match
  for (const topic of TOPIC_DATABASE) {
    const matched = topic.keywords.some((k) => lower.includes(k) || userMessage.includes(k));
    if (matched) {
      if (lang === 'ur') return topic.planUr;
      if (lang === 'roman_ur') return topic.planRomanUr;
      return topic.planEn;
    }
  }

  // General supportive plan for general parenting concerns
  if (lang === 'ur') {
    return {
      isEscalation: false,
      language: 'ur',
      empathyNote:
        'والدین بننا بے شمار چیلنجز کا نام ہے، اور آپ کا اپنے بچے کی بہتری کے لیے سوچنا ہی ایک شاندار کوشش ہے۔',
      actionPlan: [
        'بچے کی بات کو پہلے ہمدردی سے سنیں اور اس کے جذبات کا نام دیں (جیسے "میں سمجھ سکتا ہوں کہ آپ اداس ہیں")۔',
        'اپنے ردعمل کو پرسکون رکھیں؛ جب والدین پرسکون رہتے ہیں تو بچہ بھی خود کو محفوظ محسوس کرتا ہے۔',
        'واضح، سادہ اور مستقل مزاجی سے حدود قائم کریں، بغیر غصے یا طنز کے۔',
      ],
      checkIn:
        'اس طریقہ کار کو اگلے 24 گھنٹوں میں آزمائیں اور کل واپس آ کر بتائیں کہ کیسا رہا؟',
      disclaimer: 'عملی رہنمائی برائے والدین۔ طبی یا قانونی مشاورت کے لیے متعلقہ ماہرین سے رجوع کریں۔',
    };
  }

  if (lang === 'roman_ur') {
    return {
      isEscalation: false,
      language: 'roman_ur',
      empathyNote:
        'Bachon ki parwarish me aisi mushkilaat aam hain, aur aapka is par ghaur karna hi saboot hai ke aap behtareen koshish kar rahay hain.',
      actionPlan: [
        'Bache ki baat ko pehlay dhyan se sunein aur unke jazbaat ko acknowledge karein.',
        'Apna reaction pur-sukoon rakhein taake bacha safety mehsoos kare.',
        'Naram lehjay magar mazboot iraday ke saath clear rules qaim karein.',
      ],
      checkIn:
        'Yeh approach kal subah tak aazmayein aur check-in karein ke bache ka response kaisa raha?',
      disclaimer: 'Practical coaching advice. Not medical or legal guidance.',
    };
  }

  // English general fallback
  return {
    isEscalation: false,
    language: 'en',
    empathyNote:
      "Parenting is one of the most demanding journeys, and reaching out shows your genuine care for your child's well-being.",
    actionPlan: [
      'Validate first: Name the emotion before trying to fix the problem (e.g., "I see you are feeling frustrated right now").',
      'Hold a kind but firm limit: State what you expect simply without lecturing, repeating, or raising your voice.',
      'Reconnect physically: A gentle hand on their shoulder or eye-level posture helps de-escalate tension immediately.',
    ],
    checkIn:
      'Practice this "Connection before Correction" step over the next 24 hours, and let me know how your child responds tomorrow.',
    disclaimer: 'Practical parenting coaching. Consult healthcare professionals for medical or developmental diagnoses.',
  };
}
