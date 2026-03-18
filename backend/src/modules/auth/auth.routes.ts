import { Router } from 'express';
import { authenticate } from '@middlewares/auth';
import { validateRequest } from '@utils/validateRequest';
import { registerSchema, loginSchema, refreshSchema } from './auth.validation';
import { registerMember, loginMember, refreshSession, getCurrentMember } from './auth.controller';

const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), registerMember);
authRouter.post('/login', validateRequest(loginSchema), loginMember);
authRouter.post('/refresh', validateRequest(refreshSchema), refreshSession);
authRouter.get('/me', authenticate, getCurrentMember);

export { authRouter };
