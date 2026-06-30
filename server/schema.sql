-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  google_access_token TEXT,
  google_refresh_token TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  patterns JSONB DEFAULT '{}',        -- learned procrastination patterns
  preferences JSONB DEFAULT '{}',     -- communication preferences
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deadlines (high-level commitments)
CREATE TABLE deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ NOT NULL,
  domain TEXT,                        -- 'academic' | 'work' | 'financial' | 'personal'
  stakes TEXT,                        -- consequence of missing
  risk_score INTEGER DEFAULT 0,       -- 0-100, updated by agent
  completion_pct INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',       -- active | completed | missed | abandoned
  google_task_id TEXT,                -- synced Google Task ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subtasks (atomic steps created by AI decomposition)
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deadline_id UUID REFERENCES deadlines(id),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  order_index INTEGER,
  status TEXT DEFAULT 'pending',
  calendar_event_id TEXT,             -- Google Calendar event ID
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Agent interventions (audit trail of all NEXUS actions)
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  deadline_id UUID REFERENCES deadlines(id),
  type TEXT,                          -- checkin | crisis | decompose | schedule | email_draft
  content JSONB,                      -- full intervention data
  user_response TEXT,                 -- approved | dismissed | modified
  created_at TIMESTAMPTZ DEFAULT NOW()
);
