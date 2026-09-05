import { ProductCategory, SkinType } from "../../../shared/domain/SkinType";

export interface ProductFilterCriteria {
  category?: ProductCategory;
  recommendedSkinType?: SkinType;
  handmadeOnly?: boolean;
  organicOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  inStockOnly?: boolean;
}
