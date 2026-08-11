import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  accessTtlSeconds: parseInt(process.env.JWT_ACCESS_TTL_SECONDS ?? '900', 10),
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshTtlSeconds: parseInt(
    process.env.JWT_REFRESH_TTL_SECONDS ?? `${7 * 24 * 60 * 60}`,
    10,
  ),
}));
