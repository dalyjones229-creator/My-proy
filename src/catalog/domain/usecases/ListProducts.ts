import { Product } from "../entities/Product";
import { ProductRepository } from "../repositories/ProductRepository";

export interface ListProductsInput {
  onlyAvailable?: boolean;
}

export interface ListProductsResult {
  products: Product[];
  total: number;
}

export class ListProducts {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: ListProductsInput = {}): Promise<ListProductsResult> {
    const all = await this.productRepository.findAll();
    const products = input.onlyAvailable
      ? all.filter((p) => p.isAvailable())
      : all;

    return {
      products,
      total: products.length,
    };
  }
}
