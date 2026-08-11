import {
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedPrincipal } from '../../core/auth/strategies/jwt.strategy';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERMISSION_CHECKER } from '../types/permission-checker.interface';
import type { PermissionChecker } from '../types/permission-checker.interface';

/**
 * Global guard (registered via APP_GUARD in app.module.ts). Two layers:
 * 1. Authentication — delegates to the passport 'jwt' strategy (same as the
 *    old per-controller JwtAuthGuard it replaces), skipped for @Public().
 * 2. Authorization — only routes carrying @RequirePermission() are checked
 *    against the caller's role; everything else just needs a valid token
 *    (matches /users/me, /auth/logout, which need "any signed-in principal").
 */
@Injectable()
export class RolesGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    @Inject(PERMISSION_CHECKER)
    private readonly permissionChecker: PermissionChecker,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const authenticated = (await super.canActivate(context)) as boolean;
    if (!authenticated) return false;

    const requiredPermission = this.reflector.getAllAndOverride<string>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermission) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedPrincipal }>();
    const principal = request.user;

    if (
      !principal ||
      principal.type !== 'admin' ||
      !(await this.permissionChecker.adminHasPermission(
        principal.id,
        requiredPermission,
      ))
    ) {
      throw new ForbiddenException({
        code: 'AUTH_003',
        message: 'Permission denied',
      });
    }

    return true;
  }
}
