import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesRepository } from '../companies.repository';
import { CompaniesService } from '../companies.service';
import { Company } from '../entities/company.entity';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repository: jest.Mocked<CompaniesRepository>;

  const buildCompany = (overrides: Partial<Company> = {}): Company => ({
    id: 1,
    name: 'Acme Corp',
    slug: 'acme-corp',
    logoUrl: null,
    description: null,
    size: null,
    createdBy: 1,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: CompaniesRepository,
          useValue: {
            findBySlug: jest.fn(),
            findById: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CompaniesService);
    repository = module.get(CompaniesRepository);
  });

  describe('create', () => {
    it('creates a company with a slugified name when the slug is not taken', async () => {
      repository.findBySlug.mockResolvedValue(null);
      const created = buildCompany();
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);

      const result = await service.create({ name: 'Acme Corp' }, 1);

      expect(repository.findBySlug).toHaveBeenCalledWith('acme-corp');
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'acme-corp', createdBy: 1 }),
      );
      expect(result).toBe(created);
    });

    it('throws COMPANIES_002 conflict when the slug already exists', async () => {
      repository.findBySlug.mockResolvedValue(buildCompany());

      await expect(
        service.create({ name: 'Acme Corp' }, 1),
      ).rejects.toMatchObject(
        new ConflictException({
          code: 'COMPANIES_002',
          message: 'Slug already exists',
        }),
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findBySlugOrThrow', () => {
    it('returns the company when found', async () => {
      const company = buildCompany();
      repository.findBySlug.mockResolvedValue(company);

      await expect(service.findBySlugOrThrow('acme-corp')).resolves.toBe(
        company,
      );
    });

    it('throws COMPANIES_001 not found when no company matches', async () => {
      repository.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlugOrThrow('unknown')).rejects.toMatchObject(
        new NotFoundException({
          code: 'COMPANIES_001',
          message: 'Company not found',
        }),
      );
    });
  });

  describe('update', () => {
    it('merges the DTO into the existing company and saves it', async () => {
      const company = buildCompany();
      repository.findById.mockResolvedValue(company);
      repository.save.mockImplementation((c) => Promise.resolve(c));

      const result = await service.update(1, { description: 'Updated' });

      expect(result.description).toBe('Updated');
      expect(result.slug).toBe('acme-corp');
    });

    it('throws COMPANIES_001 when the company does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update(999, { description: 'x' }),
      ).rejects.toMatchObject(
        new NotFoundException({
          code: 'COMPANIES_001',
          message: 'Company not found',
        }),
      );
    });
  });

  describe('deactivate', () => {
    it('soft-deletes an existing company', async () => {
      repository.findById.mockResolvedValue(buildCompany());

      await service.deactivate(1);

      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it('throws COMPANIES_001 when the company does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deactivate(999)).rejects.toMatchObject(
        new NotFoundException({
          code: 'COMPANIES_001',
          message: 'Company not found',
        }),
      );
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });
});
