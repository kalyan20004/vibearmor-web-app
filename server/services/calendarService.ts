import { google } from 'googleapis';
import { supabase } from './supabaseClient';

export class CalendarService {
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

  async getFreeSlots(userId: string, timeMin: string, timeMax: string) {
    try {
      await this.setCredentialsForUser(userId);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          items: [{ id: 'primary' }],
        }
      });
      return response.data.calendars?.primary?.busy || [];
    } catch (error) {
      console.error('[Calendar] Error fetching free slots:', error);
      return [];
    }
  }

  async scheduleTaskBlock(userId: string, title: string, description: string, startTime: string, endTime: string) {
    try {
      await this.setCredentialsForUser(userId);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      const event = {
        summary: `[VibeArmor] ${title}`,
        description,
        start: { dateTime: startTime, timeZone: 'Asia/Kolkata' },
        end: { dateTime: endTime, timeZone: 'Asia/Kolkata' },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 10 }],
        },
      };
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
      return response.data.id;
    } catch (error) {
      console.error('[Calendar] Error scheduling event:', error);
      return null;
    }
  }
  async deleteTaskBlock(userId: string, eventId: string) {
    try {
      await this.setCredentialsForUser(userId);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
      return true;
    } catch (error) {
      console.error(`[Calendar] Error deleting event ${eventId}:`, error);
      return false;
    }
  }
}

export const calendarService = new CalendarService();
