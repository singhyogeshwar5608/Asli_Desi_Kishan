import bcrypt from 'bcryptjs';
import { config } from '@config/env';

export const PasswordService = {
  hash: async (plain: string) => {
    return bcrypt.hash(plain, config.jwt.saltRounds);
  },
  compare: async (plain: string, hash: string) => {
    return bcrypt.compare(plain, hash);
  },
};
