import { NextRequest, NextResponse } from 'next/server';
import { generateCoachResponse } from '@/lib/llmProvider';
import { ChatRequest, ChatResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required.' },
        { status: 400 }
      );
    }

    const plan = await generateCoachResponse(
      body.messages,
      body.apiKey,
      body.provider,
      body.model
    );

    // Format human-readable message representation for chat display
    const isUrdu = plan.language === 'ur';
    const actionHeading = isUrdu ? '**عملی لائحہ عمل:**' : '**Action Plan:**';
    const checkInHeading = isUrdu ? '**فالو اپ چیک ان:**' : '**Follow-up Check-in:**';

    const readableMessage = `${plan.empathyNote}\n\n${actionHeading}\n${plan.actionPlan
      .map((step, idx) => `${idx + 1}. ${step}`)
      .join('\n')}\n\n${checkInHeading}\n${plan.checkIn}`;

    const response: ChatResponse = {
      message: readableMessage,
      structuredPlan: plan,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const msg: string = error?.message || '';
    if (msg.startsWith('API_KEY_INVALID')) {
      return NextResponse.json({ error: msg.replace('API_KEY_INVALID: ', '') }, { status: 401 });
    }
    if (msg.startsWith('API_KEY_QUOTA')) {
      return NextResponse.json({ error: msg.replace('API_KEY_QUOTA: ', '') }, { status: 429 });
    }
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred while generating advice.' },
      { status: 500 }
    );
  }
}
