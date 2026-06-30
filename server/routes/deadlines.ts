import { Router } from 'express';
import { taskService } from '../services/taskService';
import { agentService } from '../services/agentService';
import { calendarService } from '../services/calendarService';

const router = Router();

// Middleware to mock userId for now, or use real user if authenticated
router.use((req, res, next) => {
  // In a real app with OAuth, we would use req.user.id
  // For the hackathon demo, if not logged in via OAuth, we'll use a dummy ID or the first user in DB.
  // Assuming the OAuth flow works, `req.user` will be populated by passport.
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in with Google.' });
  }
  next();
});

// GET all deadlines
router.get('/', async (req: any, res) => {
  try {
    const deadlines = await taskService.getDeadlines(req.user.id);
    res.json(deadlines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deadlines' });
  }
});

// POST new deadline
router.post('/', async (req: any, res) => {
  try {
    let deadline = await taskService.createDeadline(req.user.id, req.body);
    
    // 1. Asynchronously trigger the AI risk assessment and Sentinel decomposition
    // We run this in the background so the frontend instantly shows the new task
    setTimeout(async () => {
      try {
        const riskScore = await agentService.assessRisk(deadline.id, deadline);
        await taskService.updateDeadline(req.user.id, deadline.id, { risk_score: riskScore });
      } catch (riskError) {
        console.error('[Deadlines API] Failed to assess initial risk:', riskError);
      }
      agentService.runSentinelCheck().catch(console.error);
    }, 100);

    res.status(201).json(deadline);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create deadline' });
  }
});

// PUT update deadline
router.put('/:id', async (req: any, res) => {
  try {
    const deadline = await taskService.updateDeadline(req.user.id, req.params.id, req.body);
    res.json(deadline);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update deadline' });
  }
});

// DELETE deadline
router.delete('/:id', async (req: any, res) => {
  try {
    await taskService.deleteDeadline(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete deadline' });
  }
});

// POST schedule via AI
router.post('/:id/schedule', async (req: any, res) => {
  const { id } = req.params;
  const { description } = req.body;
  
  try {
    const subtasks = await agentService.decomposeTask(id, description);
    const scheduled = [];
    for (const sub of subtasks) {
      const eventId = await calendarService.scheduleTaskBlock(
        req.user.id,
        sub.title, 
        sub.description, 
        new Date().toISOString(), 
        new Date(Date.now() + sub.duration_minutes * 60000).toISOString()
      );
      scheduled.push({ ...sub, calendar_event_id: eventId });
    }
    res.json({ message: 'Task scheduled successfully', scheduled });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to schedule task' });
  }
});

export default router;
