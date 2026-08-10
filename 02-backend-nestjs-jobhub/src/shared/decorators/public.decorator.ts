import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as exempt from auth. Consumed by RolesGuard once the
 * auth + roles-permissions features exist (not wired yet).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
