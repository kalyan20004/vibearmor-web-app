import { supabase } from './supabaseClient';

export class TaskService {
  async getDeadlines(userId: string) {
    const { data, error } = await supabase
      .from('deadlines')
      .select('*, subtasks(*)')
      .eq('user_id', userId)
      .order('risk_score', { ascending: false });
      
    if (error) throw error;
    return data;
  }

  async getDeadlineById(userId: string, deadlineId: string) {
    const { data, error } = await supabase
      .from('deadlines')
      .select('*, subtasks(*)')
      .eq('id', deadlineId)
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    return data;
  }

  async createDeadline(userId: string, deadlineData: any) {
    const { data, error } = await supabase
      .from('deadlines')
      .insert({
        user_id: userId,
        title: deadlineData.title,
        due_at: deadlineData.due_at,
        domain: deadlineData.domain,
        stakes: deadlineData.stakes,
        status: 'active',
        risk_score: 0,
        completion_pct: 0
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async updateDeadline(userId: string, deadlineId: string, updates: any) {
    if (updates.status === 'completed' || updates.completion_pct === 100) {
      // Check for procrastination pattern
      const { data: deadline } = await supabase.from('deadlines').select('due_at').eq('id', deadlineId).single();
      if (deadline) {
        const hoursUntilDue = (new Date(deadline.due_at).getTime() - Date.now()) / (1000 * 60 * 60);
        // If completed with less than 3 hours left, it's a last-minute completion
        if (hoursUntilDue >= 0 && hoursUntilDue < 3) {
           const { data: user } = await supabase.from('users').select('patterns').eq('id', userId).single();
           if (user) {
             const patterns = user.patterns || {};
             patterns.last_minute_completions = (patterns.last_minute_completions || 0) + 1;
             await supabase.from('users').update({ patterns }).eq('id', userId);
             console.log(`[PatternLearning] User ${userId} completed a task at the last minute! Total: ${patterns.last_minute_completions}`);
           }
        }
      }
    }

    const { data, error } = await supabase
      .from('deadlines')
      .update(updates)
      .eq('id', deadlineId)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async deleteDeadline(userId: string, deadlineId: string) {
    // Delete subtasks first due to foreign key
    await supabase.from('subtasks').delete().eq('deadline_id', deadlineId);
    
    const { error } = await supabase
      .from('deadlines')
      .delete()
      .eq('id', deadlineId)
      .eq('user_id', userId);
      
    if (error) throw error;
    return { success: true };
  }
}

export const taskService = new TaskService();
