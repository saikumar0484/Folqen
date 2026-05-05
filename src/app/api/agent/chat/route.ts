import { NextRequest, NextResponse } from 'next/server'

// [Mock - Not connected to real AI]
// To enable real AI: add your API key in Settings > API Keys

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, sessionId } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const securityFlags = {
      REQUIRE_HUMAN_APPROVAL: process.env.REQUIRE_HUMAN_APPROVAL !== 'false',
      ALLOW_PUBLIC_PUBLISH: process.env.ALLOW_PUBLIC_PUBLISH === 'true',
      ALLOW_PAID_TOOLS: process.env.ALLOW_PAID_TOOLS === 'true',
    }

    // Mock - replace with real AI provider call
    const mockResponse = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '[Mock Mode] Connect an AI provider in Settings > API Keys to enable real responses.',
      sessionId,
      timestamp: new Date().toISOString(),
      securityFlags,
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    name: 'Folqen Agent Chat API',
    version: '1.0.0',
    mode: 'mock',
  })
}
