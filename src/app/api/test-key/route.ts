import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { valid: false, message: 'Please enter an API key first.' },
        { status: 400 }
      );
    }

    const key = apiKey.trim();

    if (provider === 'openai') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // Use a real (tiny) completion call — /models passes even with no credits
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'hi' }],
            max_tokens: 5,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.status === 200) {
          return NextResponse.json({
            valid: true,
            message: '✓ OpenAI key is valid and has active credits! Ready for live coaching.',
          });
        }

        if (res.status === 401) {
          return NextResponse.json({
            valid: false,
            message: '❌ Invalid OpenAI API key (401 Unauthorized). Check the key or generate a new one at platform.openai.com/api-keys.',
          });
        }

        if (res.status === 429) {
          return NextResponse.json({
            valid: false,
            message: '⚠️ Key is valid but has no billing credits (429). Add credits at platform.openai.com/settings/billing. Use Demo/Mock mode in the meantime.',
          });
        }

        if (res.status === 402) {
          return NextResponse.json({
            valid: false,
            message: '⚠️ Key is valid but payment required (402). Add billing credits at platform.openai.com/settings/billing.',
          });
        }

        const data = await res.json().catch(() => ({}));
        return NextResponse.json({
          valid: false,
          message: data?.error?.message || `OpenAI returned status ${res.status}: ${res.statusText}`,
        });
      } catch (err: any) {
        return NextResponse.json({
          valid: false,
          message: err?.name === 'AbortError' ? 'Connection timed out while verifying key.' : `Connection error: ${err?.message}`,
        });
      }
    }

    if (provider === 'gemini') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        // 1. Ask Google directly which models exist for this key
        const listRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
          {
            method: 'GET',
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (listRes.status === 400 || listRes.status === 403) {
          const errData = await listRes.json().catch(() => ({}));
          return NextResponse.json({
            valid: false,
            message: `❌ Key error: ${errData.error?.message || 'Invalid or unauthorized API key.'}`,
          });
        }

        if (!listRes.ok) {
          return NextResponse.json({
            valid: false,
            message: `Gemini returned status ${listRes.status}: ${listRes.statusText}`,
          });
        }

        const listData = await listRes.json();
        const allModels: any[] = Array.isArray(listData.models) ? listData.models : [];
        const rawGenModels = allModels
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''))
          // Filter out TTS and audio models which have 0 quota on free tier
          .filter((name: string) => !name.includes('tts') && !name.includes('audio') && !name.includes('embed'));

        // Prioritize Gemini 3.5 Flash Lite (500 RPD) and Gemini 3.8 Flash
        const genModels = Array.from(
          new Set(['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash', ...rawGenModels, 'gemma-4-26b'])
        );

        if (genModels.length === 0) {
          const names = allModels.map((m: any) => m.name.replace(/^models\//, '')).slice(0, 5).join(', ');
          return NextResponse.json({
            valid: false,
            message: `⚠️ Key is active, but has no generateContent models enabled (Available: ${names || 'none'}).`,
          });
        }

        // Try generating with each model that Google reported as available
        let lastErr = '';
        for (const modelToTest of genModels.slice(0, 4)) {
          try {
            const genRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelToTest}:generateContent?key=${key}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
                  generationConfig: { maxOutputTokens: 5 },
                }),
              }
            );

            if (genRes.ok) {
              return NextResponse.json({
                valid: true,
                message: `✓ Gemini API key is valid and working with model ${modelToTest}!`,
              });
            }

            const genErr = await genRes.json().catch(() => ({}));
            lastErr = genErr.error?.message || `Status ${genRes.status}`;
          } catch (e: any) {
            lastErr = e.message;
          }
        }

        return NextResponse.json({
          valid: false,
          message: `Generation failed on [${genModels.slice(0, 3).join(', ')}]: ${lastErr}`,
        });
      } catch (err: any) {
        return NextResponse.json({
          valid: false,
          message: err?.name === 'AbortError' ? 'Connection timed out while verifying key.' : `Connection error: ${err?.message}`,
        });
      }
    }

    return NextResponse.json(
      { valid: false, message: 'Unsupported provider for key testing.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, message: error?.message || 'Server error while verifying key.' },
      { status: 500 }
    );
  }
}
