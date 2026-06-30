import { google } from 'googleapis';
import { supabase } from './supabaseClient';
import { geminiService } from './geminiService';
import { SchemaType } from '@google/generative-ai';

export class GmailService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
  }

  async setCredentialsForUser(userId: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('google_access_token, google_refresh_token')
      .eq('id', userId)
      .single();

    if (error || !user || !user.google_access_token) {
      throw new Error('User not found or no Google tokens available');
    }

    this.oauth2Client.setCredentials({
      access_token: user.google_access_token,
      refresh_token: user.google_refresh_token,
    });
  }

  async extractDeadlinesFromInbox(userId: string) {
    console.log(`[GmailWatcher] Scanning inbox for user: ${userId}`);
    try {
      await this.setCredentialsForUser(userId);
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      // Fetch the last 10 unread emails
      const res = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 10
      });

      const messages = res.data.messages || [];
      const extractedDeadlines = [];

      for (const msg of messages) {
        if (!msg.id) continue;
        
        const msgDetails = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full'
        });

        // Simple extraction of subject and snippet
        const headers = msgDetails.data.payload?.headers || [];
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const sender = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
        const snippet = msgDetails.data.snippet || '';

        const emailContent = `From: ${sender}\nSubject: ${subject}\nBody preview: ${snippet}`;
        
        // Pass to Gemini to check for deadlines
        const prompt = `Analyze the following email and determine if it contains a clear deadline, assignment due date, or required task completion date.
If it does, extract the task title, the due date (in ISO 8601 format relative to today if necessary), the domain (academic, work, personal), and the stakes.
If it does NOT contain a deadline, return null for the task_title.

Email content:
${emailContent}`;

        const schema: any = {
          type: SchemaType.OBJECT,
          properties: {
            task_title: { type: SchemaType.STRING, description: "The title of the deadline, or null if no deadline found." },
            due_at: { type: SchemaType.STRING, description: "ISO 8601 datetime" },
            domain: { type: SchemaType.STRING, description: "academic, work, or personal" },
            stakes: { type: SchemaType.STRING, description: "The consequence of missing this deadline" }
          }
        };

        const analysis = await geminiService.generateStructured(prompt, schema);

        if (analysis.task_title && analysis.task_title !== 'null') {
          console.log(`[GmailWatcher] Found deadline: ${analysis.task_title} from email: ${subject}`);
          extractedDeadlines.push({
            title: analysis.task_title,
            due_at: analysis.due_at || new Date(Date.now() + 86400000).toISOString(),
            domain: analysis.domain || 'work',
            stakes: analysis.stakes || `Extracted from email: ${subject}`
          });
          
          // Mark email as read so we don't process it again
          await gmail.users.messages.modify({
            userId: 'me',
            id: msg.id,
            requestBody: { removeLabelIds: ['UNREAD'] }
          });
        }
      }
      
      return extractedDeadlines;
    } catch (error) {
      console.error('[GmailWatcher] Error extracting deadlines:', error);
      return [];
    }
  }
}

export const gmailService = new GmailService();
