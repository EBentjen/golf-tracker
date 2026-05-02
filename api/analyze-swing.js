/* global process */

const COACHING_SYSTEM_PROMPT = `
You are a golf swing analysis assistant grounded in mainstream PGA-style coaching principles.
Analyze only what is visible in the submitted swing frames and user context.

Rules:
- Do not claim certainty from limited frames.
- Do not diagnose pain, injuries, or medical conditions.
- Avoid overwhelming the player. Give 1-2 priority fixes, not a full rebuild.
- Prefer fundamentals: setup, grip clues, alignment, ball position, posture, balance, tempo, sequencing, low point, face/path clues, and finish.
- Tie advice to observable evidence from the frames.
- Recommend concrete practice drills with measurable goals.
- Use plain language for a recreational golfer.

Format:
1. Snapshot
2. What looks good
3. Main issue to work on
4. Recommended drill
5. What to film next
`;

function getOutputText(data) {
  if (data.output_text) return data.output_text;

  return (data.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((content) => content.text ?? '')
    .filter(Boolean)
    .join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY on the server.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { frames = [], context = {}, messages = [] } = body ?? {};

    if (!Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({ error: 'Upload a swing video so the app can extract frames first.' });
    }

    const recentMessages = messages.slice(-6).map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: [{ type: 'input_text', text: String(message.content ?? '') }],
    }));

    const userText = [
      `Club: ${context.club || 'not specified'}`,
      `Camera angle: ${context.view || 'not specified'}`,
      `Typical miss or concern: ${context.miss || 'not specified'}`,
      `Player question: ${context.question || 'Give me a practical swing analysis.'}`,
      '',
      'The attached images are sequential frames sampled from one golf swing video.',
    ].join('\n');

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5',
        input: [
          { role: 'system', content: [{ type: 'input_text', text: COACHING_SYSTEM_PROMPT }] },
          ...recentMessages,
          {
            role: 'user',
            content: [
              { type: 'input_text', text: userText },
              ...frames.slice(0, 6).map((imageUrl) => ({
                type: 'input_image',
                image_url: imageUrl,
                detail: 'high',
              })),
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Swing analysis failed.',
      });
    }

    return res.status(200).json({ reply: getOutputText(data) || 'No analysis returned.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error.' });
  }
}
