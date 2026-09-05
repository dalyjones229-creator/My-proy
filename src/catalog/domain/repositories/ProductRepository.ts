import { Product } from "../entities/Product";
import { ProductFilterCriteria } from "../entities/ProductFilterCriteria";

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<void>;
  search(criteria: ProductFilterCriteria): Promise<Product[]>;
}
