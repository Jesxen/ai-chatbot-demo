import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getKnowledgeBase, getBusinessName } from './upload.js';

const router = express.Router();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const kb = getKnowledgeBase();
    const biz = getBusinessName();

    if (!kb) {
      return res.status(400).json({
        error:
          'No knowledge base loaded. Please upload a .txt knowledge base file in the setup screen before chatting.',
      });
    }

    // Build system prompt
    const systemPrompt = `You are a helpful AI assistant for ${biz}.

LANGUAGE RULE: Detect the language the user is writing in and always respond in that same language. If the user writes in Spanish, respond in Spanish. If French, respond in French. Match the user's language exactly every time.

KNOWLEDGE RULE: Answer questions ONLY using the information in the knowledge base below. Do not use outside knowledge or make up information. If a question cannot be answered from the knowledge base, say so politely and suggest contacting the business directly — in the user's language.

Be professional, friendly, and concise. Format responses clearly.

--- KNOWLEDGE BASE ---
${kb}
--- END KNOWLEDGE BASE ---`;

    // Take at most the last 10 messages for context (5 exchanges)
    const recentHistory = conversationHistory.slice(-10);

    // Build messages array: history + current user message
    const messages = [
      ...recentHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: 'user',
        content: message.trim(),
      },
    ];

    console.log(
      `[Chat] "${biz}" — user message: "${message.trim().slice(0, 80)}${message.length > 80 ? '…' : ''}"`
    );

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const reply = response.content[0]?.text || 'Sorry, I could not generate a response.';

    console.log(`[Chat] Reply: "${reply.slice(0, 80)}${reply.length > 80 ? '…' : ''}"`);

    return res.json({ reply });
  } catch (err) {
    console.error('[Chat Error]', err);

    // Surface Anthropic API errors helpfully
    if (err?.status === 401) {
      return res.status(500).json({ error: 'Invalid Anthropic API key. Check your .env file.' });
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
