import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_MESSAGE_LENGTH = 2000;

// Strip characters that could escape the system prompt template
function sanitizeName(str) {
  return String(str)
    .replace(/[<>{}|\\]/g, '')
    .slice(0, 100)
    .trim() || 'My Business';
}

// POST /api/chat
// Stateless: receives knowledgeBase + businessName from frontend each request.
router.post('/', async (req, res) => {
  try {
    const { message, knowledgeBase, businessName, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` });
    }

    if (!knowledgeBase || typeof knowledgeBase !== 'string' || !knowledgeBase.trim()) {
      return res.status(400).json({ error: 'No knowledge base provided. Please reload and upload your file.' });
    }

    const biz = sanitizeName(businessName || 'My Business');

    const systemPrompt = `You are a helpful AI assistant for ${biz}.

LANGUAGE RULE: Detect the language the user is writing in and always respond in that same language. If the user writes in Spanish, respond in Spanish. If French, respond in French. Match the user's language exactly every time.

KNOWLEDGE RULE: Answer questions ONLY using the information in the knowledge base below. Do not use outside knowledge or make up information. If a question cannot be answered from the knowledge base, say so politely and suggest contacting the business directly — in the user's language.

Be professional, friendly, and concise. Format responses clearly.

--- KNOWLEDGE BASE ---
${knowledgeBase}
--- END KNOWLEDGE BASE ---`;

    const recentHistory = conversationHistory.slice(-10);

    const messages = [
      ...recentHistory.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content).slice(0, MAX_MESSAGE_LENGTH),
      })),
      { role: 'user', content: message.trim() },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const reply = response.content[0]?.text || 'Sorry, I could not generate a response.';
    return res.json({ reply });

  } catch (err) {
    console.error('[Chat Error]', err);

    if (err?.status === 401) {
      return res.status(500).json({ error: 'Invalid Anthropic API key.' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
    }
    if (err?.status === 529) {
      return res.status(503).json({ error: 'Anthropic API is overloaded. Please try again shortly.' });
    }

    return res.status(500).json({ error: 'Failed to get a response. Please try again.' });
  }
});

export default router;
