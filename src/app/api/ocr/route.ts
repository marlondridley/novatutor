import { NextRequest, NextResponse } from 'next/server';

/**
 * OCR API endpoint - extracts text from images
 * 
 * Uses OpenAI Vision API for text extraction
 * Falls back to basic response if API is unavailable
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = imageFile.type || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Try OpenAI Vision API for OCR
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Extract ALL text from this image. Return only the extracted text, nothing else. If it\'s handwritten notes, transcribe them carefully. If there are diagrams or formulas, describe them briefly.',
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: dataUrl,
                    },
                  },
                ],
              },
            ],
            max_tokens: 2000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const extractedText = data.choices?.[0]?.message?.content || '';
          
          return NextResponse.json({
            text: extractedText,
            source: 'openai-vision',
          });
        }
      } catch (err) {
        console.error('OpenAI Vision API error:', err);
      }
    }

    // Try Anthropic Vision API as fallback
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    if (anthropicKey) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: mimeType,
                      data: base64,
                    },
                  },
                  {
                    type: 'text',
                    text: 'Extract ALL text from this image. Return only the extracted text, nothing else. If it\'s handwritten notes, transcribe them carefully. If there are diagrams or formulas, describe them briefly.',
                  },
                ],
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const extractedText = data.content?.[0]?.text || '';
          
          return NextResponse.json({
            text: extractedText,
            source: 'anthropic-vision',
          });
        }
      } catch (err) {
        console.error('Anthropic Vision API error:', err);
      }
    }

    // No API available - return helpful message
    return NextResponse.json({
      text: `[Image: ${imageFile.name}]\n\nTip: Type out the key points from your image here!`,
      source: 'fallback',
    });

  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

