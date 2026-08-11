import { MigrationInterface, QueryRunner } from 'typeorm';

const CATEGORIES: Array<{ name: string; slug: string }> = [
  { name: 'Software Engineering', slug: 'software-engineering' },
  { name: 'Design', slug: 'design' },
  { name: 'Product', slug: 'product' },
  { name: 'Marketing', slug: 'marketing' },
  { name: 'Sales', slug: 'sales' },
  { name: 'Finance', slug: 'finance' },
];

export class SeedCategories1786374363374 implements MigrationInterface {
  name = 'SeedCategories1786374363374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const category of CATEGORIES) {
      await queryRunner.query(
        `INSERT INTO categories (name, slug) VALUES (?, ?)`,
        [category.name, category.slug],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const slugs = CATEGORIES.map((c) => c.slug);
    await queryRunner.query(
      `DELETE FROM categories WHERE slug IN (${slugs.map(() => '?').join(',')})`,
      slugs,
    );
  }
}
