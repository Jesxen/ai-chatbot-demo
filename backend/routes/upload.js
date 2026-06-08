import express from 'express';
import multer from 'multer';
import path from 'path';
import { createRequire } from 'module';
import Anthropic from '@anthropic-ai/sdk';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let knowledgeBase = null;
let businessName = null;
let suggestedQuestions = [];

export function getKnowledgeBase() { return knowledgeBase; }
export function getBusinessName() { return businessName; }

const storage = multer.memoryStorage();

const ALLOWED_TYPES = {
  '.txt': ['text/plain', 'application/octet-stream'],
  '.pdf': ['application/pdf', 'application/octet-stream'],
};

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ALLOWED_TYPES[ext];
  if (allowed) {
    cb(null, true);
  } else {
    cb(new Error('Only .txt and .pdf files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

async function extractText(buffer, filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }
  return buffer.toString('utf-8');
}

async function generateSuggestedQuestions(content, biz) {
  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Based on this knowledge base for "${biz}", generate exactly 3 short natural questions a customer would ask. Return ONLY a valid JSON array of 3 strings, nothing else.\n\nKnowledge base:\n${content.slice(0, 3000)}`,
      }],
    });

    const raw = res.content[0]?.text?.trim() ?? '[]';
    // Strip markdown fences if present
    const clean = raw.replace(/```json?|```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3);
    }
  } catch (err) {
    console.warn('[Upload] Could not generate suggested questions:', err.message);
  }
  return ['What services do you offer?', 'What are your business hours?', 'How can I contact you?'];
}

router.post('/', upload.single('knowledge'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please select a .txt or .pdf file.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!ALLOWED_TYPES[ext]) {
      return res.status(400).json({ error: 'Invalid file type. Only .txt and .pdf are supported.' });
    }

    let content;
    try {
      content = await extractText(req.file.buffer, req.file.originalname);
    } catch (parseErr) {
      console.error('[Upload] Parse error:', parseErr);
      return res.status(400).json({ error: 'Could not read file content. Make sure the PDF is not password-protected.' });
    }

    if (!content?.trim()) {
      return res.status(400).json({ error: 'The file appears to be empty or has no readable text.' });
    }

    knowledgeBase = content;
    businessName = req.body.businessName?.trim() || 'My Business';

    console.log(`[Upload] KB loaded for "${businessName}": ${content.length} chars from "${req.file.originalname}"`);

    suggestedQuestions = await generateSuggestedQuestions(content, businessName);
    console.log('[Upload] Suggested questions:', suggestedQuestions);

    return res.json({
      success: true,
      message: 'Knowledge base loaded successfully',
      fileName: req.file.originalname,
      charCount: content.length,
      suggestedQuestions,
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    return res.status(500).json({ error: 'Failed to process file upload.' });
  }
});

router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10 MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
