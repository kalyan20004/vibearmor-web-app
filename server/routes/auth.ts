import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { supabase } from '../services/supabaseClient';
import { calendarService } from '../services/calendarService';

const router = Router();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error || !data) {
    return done(error, null);
  }
  done(null, data);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0].value;
      if (!email) return done(new Error('No email found'), undefined);

      // Check if user exists
      let { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (!user) {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            email,
            google_access_token: accessToken,
            google_refresh_token: refreshToken || null,
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        user = newUser;
      } else {
        // Update tokens for existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            google_access_token: accessToken,
            ...(refreshToken && { google_refresh_token: refreshToken })
          })
          .eq('id', user.id)
          .select()
          .single();
          
        if (updateError) throw updateError;
        user = updatedUser;
      }

      return done(null, user);
    } catch (error: any) {
      return done(error, undefined);
    }
  }
));

router.get('/google',
  passport.authenticate('google', { 
    scope: [
      'profile', 
      'email', 
      'https://www.googleapis.com/auth/calendar.events', 
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/gmail.readonly'
    ],
    accessType: 'offline',
    prompt: 'consent'
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL || 'http://localhost:5173/' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard.
    res.redirect((process.env.CLIENT_URL || 'http://localhost:5173') + '/dashboard');
  }
);

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.json({ success: true });
  });
});

router.post('/logout-all', async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Nullify tokens in the database to revoke global background access
    const { error } = await supabase
      .from('users')
      .update({
        google_access_token: null,
        google_refresh_token: null
      })
      .eq('id', (req.user as any).id);
      
    if (error) {
      console.error('Failed to revoke tokens:', error);
      return res.status(500).json({ error: 'Failed to revoke tokens' });
    }
    
    // Clear local session
    req.logout((err) => {
      if (err) { return next(err); }
      res.json({ success: true });
    });
  } catch (error) {
    next(error);
  }
});
router.delete('/delete-account', async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const userId = (req.user as any).id;
    
    // Clean up Google Calendar events
    try {
      const { data: deadlines } = await supabase.from('deadlines').select('id').eq('user_id', userId);
      if (deadlines && deadlines.length > 0) {
        const deadlineIds = deadlines.map(d => d.id);
        const { data: subtasks } = await supabase.from('subtasks').select('calendar_event_id').in('deadline_id', deadlineIds);
        
        if (subtasks) {
          for (const sub of subtasks) {
            if (sub.calendar_event_id) {
              await calendarService.deleteTaskBlock(userId, sub.calendar_event_id);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to cleanup calendar events:', e);
      // Proceed with account deletion anyway to not strand the user
    }
    
    // Delete deadlines associated with the user
    await supabase.from('deadlines').delete().eq('user_id', userId);
    
    // Delete the user record completely
    const { error } = await supabase.from('users').delete().eq('id', userId);
      
    if (error) {
      console.error('Failed to delete account:', error);
      return res.status(500).json({ error: 'Failed to delete account' });
    }
    
    // Clear local session
    req.logout((err) => {
      if (err) { return next(err); }
      res.json({ success: true });
    });
  } catch (error) {
    next(error);
  }
});

export default router;
