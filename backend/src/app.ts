import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import passport from './config/passport';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import calendarRoutes from './routes/calendarRoutes';
import pomodoroRoutes from './routes/pomodoroRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import oauthRoutes from './routes/oauthRoutes';
import tagRoutes from './routes/tagRoutes';
import settingsRoutes from './routes/settingsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { authenticate } from './middlewares/auth';
import { checkAndCreateNotifications } from './services/notificationService';

const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/test-notifications', authenticate, async (req, res, next) => {
  try {
    await checkAndCreateNotifications(req.user!.userId);
    res.json({ message: 'Done' });
  } catch (err) {
    next(err);
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export default app;
