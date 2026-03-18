import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from '@config/env';
import { notFoundHandler } from '@middlewares/notFound';
import { errorHandler } from '@middlewares/errorHandler';
import { registerModuleRoutes } from '@modules/routes';

const app = express();

const corsOrigins = [
  config.clientWebOrigin,
  config.clientFlutterOrigin,
].filter(Boolean) as string[];

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(config.isDev ? 'dev' : 'combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

registerModuleRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
