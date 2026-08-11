import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { AdminsService } from '../admins/admins.service';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  RefreshToken,
  RefreshTokenOwnerType,
} from './entities/refresh-token.entity';
import { RefreshTokensRepository } from './refresh-tokens.repository';

interface Principal {
  id: number;
  type: RefreshTokenOwnerType;
  fullName: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class AuthService {
  private readonly refreshTtlSeconds: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly adminsService: AdminsService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTtlSeconds = this.configService.get<number>(
      'jwt.refreshTtlSeconds',
    )!;
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.register(dto);
    return this.issueTokenPair({
      id: user.id,
      type: 'user',
      fullName: user.fullName,
      email: user.email,
      passwordHash: user.passwordHash,
    });
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const principal = await this.findPrincipalByEmail(dto.email);
    if (!principal) {
      throw new UnauthorizedException({
        code: 'AUTH_001',
        message: 'Invalid credentials',
      });
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      principal.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException({
        code: 'AUTH_001',
        message: 'Invalid credentials',
      });
    }

    return this.issueTokenPair(principal);
  }

  async refresh(refreshTokenRaw: string): Promise<AuthResponseDto> {
    const tokenHash = this.hashToken(refreshTokenRaw);
    const existing = await this.refreshTokensRepository.findByHash(tokenHash);

    if (
      !existing ||
      existing.revokedAt ||
      existing.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException({
        code: 'AUTH_002',
        message: 'Refresh token expired or invalid',
      });
    }

    existing.revokedAt = new Date();
    await this.refreshTokensRepository.save(existing);

    const principal = await this.findPrincipalById(
      existing.ownerId,
      existing.ownerType,
    );
    if (!principal) {
      throw new UnauthorizedException({
        code: 'AUTH_002',
        message: 'Refresh token expired or invalid',
      });
    }

    return this.issueTokenPair(principal);
  }

  async logout(refreshTokenRaw: string): Promise<void> {
    const tokenHash = this.hashToken(refreshTokenRaw);
    const existing = await this.refreshTokensRepository.findByHash(tokenHash);
    if (existing && !existing.revokedAt) {
      existing.revokedAt = new Date();
      await this.refreshTokensRepository.save(existing);
    }
  }

  private async findPrincipalByEmail(email: string): Promise<Principal | null> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      return {
        id: user.id,
        type: 'user',
        fullName: user.fullName,
        email: user.email,
        passwordHash: user.passwordHash,
      };
    }

    const admin = await this.adminsService.findByEmail(email);
    if (admin) {
      return {
        id: admin.id,
        type: 'admin',
        fullName: admin.fullName,
        email: admin.email,
        passwordHash: admin.passwordHash,
      };
    }

    return null;
  }

  private async findPrincipalById(
    id: number,
    type: RefreshTokenOwnerType,
  ): Promise<Principal | null> {
    if (type === 'user') {
      const user = await this.usersService
        .findByIdOrThrow(id)
        .catch(() => null);
      if (!user) return null;
      return {
        id: user.id,
        type: 'user',
        fullName: user.fullName,
        email: user.email,
        passwordHash: user.passwordHash,
      };
    }

    const admin = await this.adminsService
      .findByIdOrThrow(id)
      .catch(() => null);
    if (!admin) return null;
    return {
      id: admin.id,
      type: 'admin',
      fullName: admin.fullName,
      email: admin.email,
      passwordHash: admin.passwordHash,
    };
  }

  private async issueTokenPair(principal: Principal): Promise<AuthResponseDto> {
    const accessToken = this.jwtService.sign({
      sub: principal.id,
      type: principal.type,
    });

    const refreshTokenRaw = randomBytes(48).toString('hex');
    const refreshToken = this.refreshTokensRepository.create({
      ownerId: principal.id,
      ownerType: principal.type,
      tokenHash: this.hashToken(refreshTokenRaw),
      expiresAt: new Date(Date.now() + this.refreshTtlSeconds * 1000),
      revokedAt: null,
    } satisfies Partial<RefreshToken>);
    await this.refreshTokensRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: this.configService.get<number>('jwt.accessTtlSeconds')!,
      user: {
        id: principal.id,
        fullName: principal.fullName,
        email: principal.email,
      },
    };
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
