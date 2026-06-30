import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import session from 'express-session';
import passport from 'passport';
import path from 'path';

import authRoutes from './routes/auth';
import deadlineRoutes from './routes/deadlines';
import interventionRoutes from './routes/interventions';

const app = express();
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: clientUrl,
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'nexus-hackathon-secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/deadlines', deadlineRoutes);
app.use('/interventions', interventionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VibeArmor Agent Core' });
});

// Serve the compiled React frontend for unified deployment
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`VibeArmor server running on port ${port}`);
});
