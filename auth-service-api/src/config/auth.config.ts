import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
}));
