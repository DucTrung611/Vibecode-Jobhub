import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminsRepository } from './admins.repository';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminsService {
  constructor(private readonly adminsRepository: AdminsRepository) {}

  findByEmail(email: string): Promise<Admin | null> {
    return this.adminsRepository.findByEmail(email);
  }

  async findByIdOrThrow(id: number): Promise<Admin> {
    const admin = await this.adminsRepository.findById(id);
    if (!admin) {
      throw new NotFoundException({
        code: 'ADMINS_001',
        message: 'Admin not found',
      });
    }
    return admin;
  }
}
