import { Router } from 'express';
import { agentService } from '../services/agentService';
import { supabase } from '../services/supabaseClient';

const router = Router();

// Endpoint to fetch active interventions
router.get('/', async (req, res) => {
  // In a real app we'd use req.user.id from auth middleware. 
  // For demo, we just fetch any pending conflict_resolution
  try {
    const { data, error } = await supabase
      .from('interventions')
      .select('*')
      .eq('type', 'conflict_resolution')
      .eq('user_response', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);
    
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interventions' });
  }
});

// Endpoint to manually run the sentinel check (Time-Machine Demo Panel feature)
router.post('/simulate-sentinel', async (req, res) => {
  try {
    await agentService.runSentinelCheck();
    res.json({ message: 'Sentinel loop simulated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to run sentinel check' });
  }
});

// Endpoint to explicitly draft an extension email
router.post('/draft-email', async (req, res) => {
  const { deadlineId, taskTitle } = req.body;
  
  try {
    const draft = await agentService.draftExtensionEmail(deadlineId, taskTitle);
    res.json({ message: 'Email drafted successfully', draft });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to draft email' });
  }
});

// Endpoint for the live agent chat
router.post('/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await agentService.handleChat(message);
    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

// SSE endpoint for streaming chat
router.get('/chat/stream', async (req, res) => {
  const message = req.query.message as string;
  if (!message) return res.status(400).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const { geminiService } = await import('../services/geminiService');
    for await (const chunk of geminiService.streamChat(message)) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('SSE Error:', error);
    res.end();
  }
});

export default router;
