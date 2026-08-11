import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByIdOrThrow(id: number): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException({
        code: 'USERS_001',
        message: 'User not found',
      });
    }
    return user;
  }

  async register(data: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<User> {
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException({
        code: 'USERS_002',
        message: 'Email already registered',
      });
    }
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = this.usersRepository.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
    });
    return this.usersRepository.save(user);
  }

  async updateMe(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findByIdOrThrow(id);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async updateResumeUrl(id: number, resumeUrl: string): Promise<User> {
    const user = await this.findByIdOrThrow(id);
    user.resumeUrl = resumeUrl;
    return this.usersRepository.save(user);
  }

  async deactivate(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.usersRepository.softDelete(id);
  }
}
