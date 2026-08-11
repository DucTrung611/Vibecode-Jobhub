import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import type { AuthenticatedPrincipal } from '../../core/auth/strategies/jwt.strategy';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

const RESUME_MAX_BYTES = 5 * 1024 * 1024;
const RESUME_ALLOWED_EXT = ['.pdf', '.doc', '.docx'];

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getMe(
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findByIdOrThrow(principal.id);
    return UserResponseDto.fromEntity(user);
  }

  @Patch()
  async updateMe(
    @CurrentUser() principal: AuthenticatedPrincipal,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.updateMe(principal.id, dto);
    return UserResponseDto.fromEntity(user);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<void> {
    await this.usersService.deactivate(principal.id);
  }

  @Post('resume')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/resumes',
        filename: (_req, file, cb) => {
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`,
          );
        },
      }),
      limits: { fileSize: RESUME_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        if (
          !RESUME_ALLOWED_EXT.includes(extname(file.originalname).toLowerCase())
        ) {
          cb(
            new BadRequestException('Only PDF/DOC/DOCX files are accepted'),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadResume(
    @CurrentUser() principal: AuthenticatedPrincipal,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const resumeUrl = `/uploads/resumes/${file.filename}`;
    const user = await this.usersService.updateResumeUrl(
      principal.id,
      resumeUrl,
    );
    return UserResponseDto.fromEntity(user);
  }
}
