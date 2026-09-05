import { Product } from "../domain/entities/Product";
import { ProductFilterCriteria } from "../domain/entities/ProductFilterCriteria";
import { ProductRepository } from "../domain/repositories/ProductRepository";

export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>();

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async findAll(): Promise<Product[]> {
    return [...this.products.values()];
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }

  async search(criteria: ProductFilterCriteria): Promise<Product[]> {
    return (await this.findAll()).filter((p) => this.matches(p, criteria));
  }

  private matches(product: Product, c: ProductFilterCriteria): boolean {
    if (c.category && product.getCategory() !== c.category) return false;
    if (
      c.recommendedSkinType &&
      product.getRecommendedSkinType() !== c.recommendedSkinType
    )
      return false;
    if (c.handmadeOnly && !product.isHandmade()) return false;
    if (c.organicOnly && product.getOrganicIngredients().length === 0)
      return false;
    if (c.inStockOnly && !product.isAvailable()) return false;
    if (c.minPrice !== undefined && product.getPrice().getAmount() < c.minPrice)
      return false;
    if (c.maxPrice !== undefined && product.getPrice().getAmount() > c.maxPrice)
      return false;
    if (c.searchTerm) {
      const term = c.searchTerm.toLowerCase();
      if (!product.getName().toLowerCase().includes(term)) return false;
    }
    return true;
  }
}
