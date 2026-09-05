import "reflect-metadata";
import { Between, Repository } from "typeorm";
import { Money } from "../../../shared/domain/Money";
import { Product } from "../../../catalog/domain/entities/Product";
import { ProductFilterCriteria } from "../../../catalog/domain/entities/ProductFilterCriteria";
import { ProductRepository } from "../../../catalog/domain/repositories/ProductRepository";
import { ProductOrmEntity } from "./entities/ProductOrmEntity";

export class ProductTypeOrmRepository implements ProductRepository {
  constructor(private readonly orm: Repository<ProductOrmEntity>) {}

  async findById(id: string): Promise<Product | null> {
    const row = await this.orm.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.orm.find();
    return rows.map((r) => this.toDomain(r));
  }

  async save(product: Product): Promise<void> {
    await this.orm.save(this.toPersistence(product));
  }

  async search(criteria: ProductFilterCriteria): Promise<Product[]> {
    const where: Record<string, unknown> = {};
    if (criteria.category) where.category = criteria.category;
    if (criteria.recommendedSkinType)
      where.recommendedSkinType = criteria.recommendedSkinType;
    if (criteria.handmadeOnly) where.handmade = true;
    if (criteria.minPrice || criteria.maxPrice) {
      where.priceAmount = Between(
        criteria.minPrice ?? 0,
        criteria.maxPrice ?? Number.MAX_SAFE_INTEGER,
      );
    }

    const rows = await this.orm.find(
      Object.keys(where).length ? { where } : {},
    );

    let result = rows.map((r) => this.toDomain(r));
    if (criteria.inStockOnly) {
      result = result.filter((p) => p.getStock() > 0);
    }
    if (criteria.organicOnly) {
      result = result.filter((p) => p.getOrganicIngredients().length > 0);
    }
    if (criteria.searchTerm) {
      const term = criteria.searchTerm.toLowerCase();
      result = result.filter((p) => p.getName().toLowerCase().includes(term));
    }
    return result;
  }

  private toDomain(row: ProductOrmEntity): Product {
    return Product.create({
      id: row.id,
      name: row.name,
      description: row.description,
      price: Money.of(row.priceAmount, row.priceCurrency),
      category: row.category,
      ingredients: row.ingredients,
      organicIngredients: row.organicIngredients,
      recommendedSkinType: row.recommendedSkinType,
      handmade: row.handmade,
      stock: row.stock,
      batch: row.batch,
      active: row.active,
      createdAt: row.createdAt,
    });
  }

  private toPersistence(p: Product): ProductOrmEntity {
    const e = new ProductOrmEntity();
    e.id = p.id;
    e.name = p.getName();
    e.description = p.getDescription();
    e.priceAmount = p.getPrice().getAmount();
    e.priceCurrency = p.getPrice().getCurrency();
    e.category = p.getCategory();
    e.ingredients = [...p.getIngredients()];
    e.organicIngredients = [...p.getOrganicIngredients()];
    e.recommendedSkinType = p.getRecommendedSkinType();
    e.handmade = p.isHandmade();
    e.stock = p.getStock();
    e.batch = p.getBatch();
    e.active = p.isActive();
    e.createdAt = p.getCreatedAt();
    return e;
  }
}
