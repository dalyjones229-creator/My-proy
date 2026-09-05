import { Product } from "../entities/Product";
import { ProductFilterCriteria } from "../entities/ProductFilterCriteria";
import { ProductRepository } from "../repositories/ProductRepository";

export interface FilterProductsResult {
  products: Product[];
  total: number;
}

export class FilterProducts {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(criteria: ProductFilterCriteria): Promise<FilterProductsResult> {
    const products = await this.productRepository.search(criteria);
    return {
      products,
      total: products.length,
    };
  }
}
