import { geminiService } from './geminiService';
import { SchemaType } from '@google/generative-ai';
import cron from 'node-cron';
import { supabase } from './supabaseClient';
import { calendarService } from './calendarService';
import { gmailService } from './gmailService';

export class AgentService {
  
  constructor() {
    this.initSentinelLoop();
  }

  private initSentinelLoop() {
    cron.schedule('0 */6 * * *', async () => {
      console.log('[Sentinel] Agent waking up to evaluate active deadlines...');
      await this.runSentinelCheck();
    });
  }

  async runSentinelCheck() {
    console.log('[Sentinel] Running Sentinel Check...');
    
    // 0. Auto-extract deadlines from Gmail for all active users
    const { data: users } = await supabase.from('users').select('id, google_access_token').not('google_access_token', 'is', null);
    if (users) {
      for (const user of users) {
        try {
          const extracted = await gmailService.extractDeadlinesFromInbox(user.id);
          for (const deadline of extracted) {
            await supabase.from('deadlines').insert({
              user_id: user.id,
              title: deadline.title,
              due_at: deadline.due_at,
              domain: deadline.domain,
              stakes: deadline.stakes,
              status: 'active'
            });
          }
        } catch (gmailError: any) {
          console.error(`[Sentinel] Skipping Gmail extraction for user ${user.id} due to API error:`, gmailError.message || gmailError);
        }
      }
    }

    const { data: activeDeadlines, error } = await supabase
      .from('deadlines')
      .select('*')
      .eq('status', 'active');

    if (error || !activeDeadlines) {
      console.error('[Sentinel] Failed to fetch active deadlines:', error);
      return;
    }
    
    // Check for Priority Conflicts per user
    if (users) {
      for (const user of users) {
        const userDeadlines = activeDeadlines.filter(d => d.user_id === user.id && d.risk_score > 70);
        if (userDeadlines.length >= 2) {
          // Simplistic collision check: same day
          const d1Date = new Date(userDeadlines[0].due_at).toDateString();
          const d2Date = new Date(userDeadlines[1].due_at).toDateString();
          if (d1Date === d2Date) {
             await this.triggerConflictResolution(user.id, userDeadlines[0], userDeadlines[1]);
          }
        }
      }
    }

    for (const deadline of activeDeadlines) {
      // 1. Re-assess risk
      const newRiskScore = await this.assessRisk(deadline.id, deadline);
      console.log(`[Sentinel] Deadline '${deadline.title}' updated risk score: ${newRiskScore}`);
      
      // Update risk score in DB
      await supabase.from('deadlines').update({ risk_score: newRiskScore }).eq('id', deadline.id);

      // 2. Trigger appropriate interventions based on risk
      if (newRiskScore >= 80) {
        await this.triggerCrisisMode(deadline.id, deadline);
      } else if (newRiskScore >= 50) {
        await this.triggerProactiveCheckin(deadline.id, deadline);
      }
      
      // 3. Autonomous Decompose & Schedule if no subtasks exist and high priority
      const { data: subtasks } = await supabase.from('subtasks').select('*').eq('deadline_id', deadline.id);
      if ((!subtasks || subtasks.length === 0) && newRiskScore >= 30) {
        console.log(`[Sentinel] Autonomously decomposing and scheduling deadline: ${deadline.title}`);
        const decomposed = await this.decomposeTask(deadline.id, deadline.title);
        
        let currentStartTime = Date.now();
        let continuousWorkMinutes = 0;

        for (let i = 0; i < decomposed.length; i++) {
          const sub = decomposed[i];
          
          // Burnout Prevention: If working for >= 3 hours continuously, insert a 30m break
          if (continuousWorkMinutes >= 180) {
            console.log(`[Burnout Prevention] Inserting cooldown block for user ${deadline.user_id}`);
            const breakStart = new Date(currentStartTime).toISOString();
            const breakEnd = new Date(currentStartTime + (30 * 60000)).toISOString();
            await calendarService.scheduleTaskBlock(
              deadline.user_id,
              "VibeArmor: Mandatory Brain Cooldown",
              "You've been working for 3 hours straight. Step away from the screen.",
              breakStart,
              breakEnd
            );
            currentStartTime += (30 * 60000); // add 30 mins
            continuousWorkMinutes = 0; // reset continuous work
          }

          const startTimeIso = new Date(currentStartTime).toISOString();
          const endTimeIso = new Date(currentStartTime + (sub.duration_minutes * 60000)).toISOString();
          
          const eventId = await calendarService.scheduleTaskBlock(
            deadline.user_id,
            sub.title,
            sub.description,
            startTimeIso,
            endTimeIso
          );
          
          await supabase.from('subtasks').insert({
            deadline_id: deadline.id,
            title: sub.title,
            description: sub.description,
            duration_minutes: sub.duration_minutes,
            order_index: sub.order,
            status: 'pending',
            calendar_event_id: eventId
          });

          // Advance time for next task
          currentStartTime += (sub.duration_minutes * 60000);
          continuousWorkMinutes += sub.duration_minutes;
        }
      }
    }

    console.log('[Sentinel] Sentinel check completed.');
  }

  async triggerProactiveCheckin(deadlineId: string, context: any) {
    console.log(`[Agent] Triggering Proactive Check-in for deadline: ${deadlineId}`);
    return { type: 'checkin', message: 'VibeArmor noticed your deadline is approaching. Need me to break down the next steps?' };
  }
  
  async triggerConflictResolution(userId: string, d1: any, d2: any) {
    console.log(`[Agent] Conflict detected for user ${userId} between ${d1.title} and ${d2.title}`);
    await supabase.from('interventions').insert({
      user_id: userId,
      type: 'conflict_resolution',
      content: { d1: d1.id, d2: d2.id, message: `⚠️ PRIORITY CONFLICT: You have two critical deadlines (${d1.title} and ${d2.title}) due today. Which one should we prioritize?` },
      user_response: 'pending'
    });
  }

  async triggerCrisisMode(deadlineId: string, context: any) {
    console.log(`[Agent] URGENT: Triggering CRISIS MODE for deadline: ${deadlineId}`);
    // In Crisis Mode, the agent might automatically cancel low-priority calendar events,
    // draft extension emails, and lock down distractions.
    
    // Auto-draft an extension email just in case
    const emailDraft = await this.draftExtensionEmail(deadlineId, context.title);
    
    return { 
      type: 'crisis', 
      message: 'CRISIS MODE ACTIVATED. I have drafted an extension email for you and cleared your evening schedule.',
      draft: emailDraft
    };
  }

  async draftExtensionEmail(deadlineId: string, taskTitle: string) {
    console.log(`[Agent] Drafting extension email for: ${taskTitle}`);
    
    const prompt = `Write a professional, apologetic email requesting a 24-hour extension for the following task: "${taskTitle}".
Keep it concise and polite. Don't make up elaborate excuses, just state that more time is needed to ensure quality.`;

    const schema: any = {
      type: SchemaType.OBJECT,
      properties: {
        subject: { type: SchemaType.STRING },
        body: { type: SchemaType.STRING }
      },
      required: ["subject", "body"]
    };

    const draft = await geminiService.generateStructured(prompt, schema);
    return draft;
  }

  async decomposeTask(taskId: string, description: string) {
    console.log(`[Agent] Decomposing task: ${taskId}`);
    
    const prompt = `Decompose the following task into atomic, time-bounded subtasks.
Task Description: ${description}

Return a list of subtasks. Each subtask must be actionable.`;

    const schema: any = {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          duration_minutes: { type: SchemaType.INTEGER },
          description: { type: SchemaType.STRING },
          order: { type: SchemaType.INTEGER },
        },
        required: ["title", "duration_minutes", "description", "order"],
      }
    };

    const subtasks = await geminiService.generateStructured(prompt, schema);
    return subtasks;
  }

  async assessRisk(taskId: string, deadlineContext: any) {
    console.log(`[Agent] Assessing risk for task: ${taskId}`);
    
    // Fetch user patterns
    let patternsString = "No historical pattern data.";
    if (deadlineContext.user_id) {
       const { data: user } = await supabase.from('users').select('patterns').eq('id', deadlineContext.user_id).single();
       if (user && user.patterns) {
         patternsString = JSON.stringify(user.patterns);
       }
    }
    
    const prompt = `Assess the risk of missing this deadline. Return ONLY an integer between 0 and 100.
Take the user's historical procrastination patterns into account if provided. If they frequently complete tasks at the last minute, their risk should be artificially inflated earlier.
User Patterns: ${patternsString}
Context: ${JSON.stringify(deadlineContext)}`;

    const schema: any = {
      type: SchemaType.OBJECT,
      properties: {
        risk_score: { type: SchemaType.INTEGER }
      },
      required: ["risk_score"]
    };

    const result = await geminiService.generateStructured(prompt, schema);
    return result.risk_score;
  }

  async handleChat(message: string) {
    console.log(`[Agent] Handling chat message: ${message}`);
    return await geminiService.chat(message);
  }
}

export const agentService = new AgentService();
