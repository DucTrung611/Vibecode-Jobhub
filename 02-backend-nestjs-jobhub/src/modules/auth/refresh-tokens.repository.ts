import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.repository.findOne({ where: { tokenHash } });
  }

  create(data: Partial<RefreshToken>): RefreshToken {
    return this.repository.create(data);
  }

  save(token: RefreshToken): Promise<RefreshToken> {
    return this.repository.save(token);
  }
}
