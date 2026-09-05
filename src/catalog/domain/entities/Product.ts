import { Money } from "../../../shared/domain/Money";
import { ProductCategory, SkinType } from "../../../shared/domain/SkinType";

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: Money;
  category: ProductCategory;
  ingredients: string[];
  organicIngredients: string[];
  recommendedSkinType: SkinType;
  handmade: boolean;
  stock: number;
  batch: string;
  active: boolean;
  createdAt: Date;
}

export class Product {
  readonly id: string;
  private name: string;
  private description: string;
  private price: Money;
  private category: ProductCategory;
  private ingredients: string[];
  private organicIngredients: string[];
  private recommendedSkinType: SkinType;
  private handmade: boolean;
  private stock: number;
  private batch: string;
  private active: boolean;
  private readonly createdAt: Date;

  private constructor(props: ProductProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.price = props.price;
    this.category = props.category;
    this.ingredients = [...props.ingredients];
    this.organicIngredients = [...props.organicIngredients];
    this.recommendedSkinType = props.recommendedSkinType;
    this.handmade = props.handmade;
    this.stock = props.stock;
    this.batch = props.batch;
    this.active = props.active;
    this.createdAt = props.createdAt;
  }

  static create(props: ProductProps): Product {
    if (props.stock < 0) {
      throw new Error("El stock de un producto no puede ser negativo.");
    }
    if (props.organicIngredients.length > props.ingredients.length) {
      throw new Error(
        "Los ingredientes organicos deben ser un subconjunto de los ingredientes.",
      );
    }
    return new Product(props);
  }

  hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }

  isAvailable(): boolean {
    return this.active && this.stock > 0;
  }

  decreaseStock(quantity: number): void {
    if (!this.hasStock(quantity)) {
      throw new Error(
        `Stock insuficiente para el producto ${this.name} (lote ${this.batch}).`,
      );
    }
    this.stock -= quantity;
  }

  getPrice(): Money {
    return this.price;
  }

  getStock(): number {
    return this.stock;
  }

  getName(): string {
    return this.name;
  }

  getBatch(): string {
    return this.batch;
  }

  getDescription(): string {
    return this.description;
  }

  getCategory(): ProductCategory {
    return this.category;
  }

  getIngredients(): readonly string[] {
    return [...this.ingredients];
  }

  getOrganicIngredients(): readonly string[] {
    return [...this.organicIngredients];
  }

  getRecommendedSkinType(): SkinType {
    return this.recommendedSkinType;
  }

  isActive(): boolean {
    return this.active;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  isHandmade(): boolean {
    return this.handmade;
  }
}
