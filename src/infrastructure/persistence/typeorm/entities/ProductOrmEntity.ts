import "reflect-metadata";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { ProductCategory, SkinType } from "../../../../shared/domain/SkinType";

@Entity("products")
export class ProductOrmEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column("text")
  description!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  priceAmount!: number;

  @Column()
  priceCurrency!: string;

  @Column({ type: "varchar" })
  category!: ProductCategory;

  @Column("simple-array")
  ingredients!: string[];

  @Column("simple-array")
  organicIngredients!: string[];

  @Column({ type: "varchar" })
  recommendedSkinType!: SkinType;

  @Column("boolean")
  handmade!: boolean;

  @Column("int")
  stock!: number;

  @Column()
  batch!: string;

  @Column("boolean")
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
