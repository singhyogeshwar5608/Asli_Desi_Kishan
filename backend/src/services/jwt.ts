import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { config } from '@config/env';

export interface TokenPayload extends JwtPayload {
  sub: string;
  role: 'ADMIN' | 'MEMBER';
}

const accessOptions: SignOptions = {
  expiresIn: config.jwt.accessExpiresIn as SignOptions['expiresIn'],
};

const refreshOptions: SignOptions = {
  expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
};

export const JwtService = {
  signAccessToken: (payload: TokenPayload) => {
    return jwt.sign(payload, config.jwt.accessSecret, accessOptions);
  },
  signRefreshToken: (payload: TokenPayload) => {
    return jwt.sign(payload, config.jwt.refreshSecret, refreshOptions);
  },
  verifyAccessToken: (token: string) => {
    return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
  },
  verifyRefreshToken: (token: string) => {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  },
};
