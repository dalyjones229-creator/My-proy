import { Money } from "../shared/domain/Money";
import { Product, ProductProps } from "../catalog/domain/entities/Product";
import { ProductCategory, SkinType } from "../shared/domain/SkinType";

interface ProductSeed {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  ingredients: string[];
  organicIngredients: string[];
  recommendedSkinType: SkinType;
  stock: number;
  batch: string;
  color1: string;
  color2: string;
  emoji: string;
}

const SEEDS: ProductSeed[] = [
  {
    id: "p1",
    name: "Jabon de Lavanda",
    description: "Jabon relajante con aceite esencial de lavanda, ideal para la noche.",
    price: 18000,
    category: ProductCategory.Soap,
    ingredients: ["aceite de oliva", "manteca de cacao", "lavanda"],
    organicIngredients: ["aceite de oliva", "lavanda"],
    recommendedSkinType: SkinType.Sensitive,
    stock: 12,
    batch: "LOT-LAV-01",
    color1: "#c9b6ef",
    color2: "#8e7cc3",
    emoji: "🌸",
  },
  {
    id: "p2",
    name: "Jabon de Carbon Activado",
    description: "Detox profundo para piel grasa y con poros abiertos.",
    price: 22000,
    category: ProductCategory.Soap,
    ingredients: ["aceite de coco", "carbon activado"],
    organicIngredients: ["aceite de coco"],
    recommendedSkinType: SkinType.Oily,
    stock: 8,
    batch: "LOT-CAR-01",
    color1: "#6b7280",
    color2: "#1f2937",
    emoji: "🌑",
  },
  {
    id: "p3",
    name: "Jabon de Avena y Miel",
    description: "Exfoliacion suave y humectacion con miel organica.",
    price: 19500,
    category: ProductCategory.Soap,
    ingredients: ["aceite de oliva", "avena", "miel"],
    organicIngredients: ["aceite de oliva", "avena", "miel"],
    recommendedSkinType: SkinType.Dry,
    stock: 0,
    batch: "LOT-AVE-01",
    color1: "#f3d9a0",
    color2: "#e0b96a",
    emoji: "🍯",
  },
  {
    id: "p4",
    name: "Balsamo de Cacao",
    description: "Balsamo labial nutritivo hecho a mano.",
    price: 15500,
    category: ProductCategory.LipBalm,
    ingredients: ["manteca de cacao", "cera de abeja"],
    organicIngredients: ["manteca de cacao"],
    recommendedSkinType: SkinType.All,
    stock: 20,
    batch: "LOT-BAL-01",
    color1: "#c79a72",
    color2: "#8a5a32",
    emoji: "🍫",
  },
  {
    id: "p5",
    name: "Jabon de Calendula",
    description: "Calma irritaciones con flores de calendula bio.",
    price: 17500,
    category: ProductCategory.Soap,
    ingredients: ["aceite de oliva", "calendula"],
    organicIngredients: ["aceite de oliva", "calendula"],
    recommendedSkinType: SkinType.Sensitive,
    stock: 15,
    batch: "LOT-CAL-01",
    color1: "#f6c453",
    color2: "#ef9f1f",
    emoji: "🌼",
  },
  {
    id: "p6",
    name: "Jabon de Menta",
    description: "Sensacion fresca y tonificante para el dia a dia.",
    price: 18500,
    category: ProductCategory.Soap,
    ingredients: ["aceite de coco", "menta"],
    organicIngredients: ["aceite de coco", "menta"],
    recommendedSkinType: SkinType.Combination,
    stock: 10,
    batch: "LOT-MEN-01",
    color1: "#a7e8c0",
    color2: "#5cc88a",
    emoji: "🌱",
  },
  {
    id: "p7",
    name: "Jabon de Rosas",
    description: "Hidratacion aromatica con petalos de rosa.",
    price: 21000,
    category: ProductCategory.Soap,
    ingredients: ["aceite de oliva", "rosa"],
    organicIngredients: ["aceite de oliva", "rosa"],
    recommendedSkinType: SkinType.Dry,
    stock: 6,
    batch: "LOT-ROS-01",
    color1: "#f4b6c2",
    color2: "#e07a90",
    emoji: "🌹",
  },
  {
    id: "p8",
    name: "Manteca de Karite",
    description: "Crema corporal reconstituyente de karite puro.",
    price: 24500,
    category: ProductCategory.BodyButter,
    ingredients: ["manteca de karite", "aceite de almendras"],
    organicIngredients: ["manteca de karite", "aceite de almendras"],
    recommendedSkinType: SkinType.All,
    stock: 9,
    batch: "LOT-KAR-01",
    color1: "#efe2c0",
    color2: "#d8c089",
    emoji: "🧈",
  },
  {
    id: "p9",
    name: "Shampoo Solido",
    description: "Barra lavante sin envase para cabello normal.",
    price: 23000,
    category: ProductCategory.ShampooBar,
    ingredients: ["tensoactivos vegetales", "aceite de jojoba"],
    organicIngredients: ["aceite de jojoba"],
    recommendedSkinType: SkinType.Normal,
    stock: 11,
    batch: "LOT-SHA-01",
    color1: "#cfe3f0",
    color2: "#9cc4dd",
    emoji: "🧴",
  },
  {
    id: "p10",
    name: "Jabon Exfoliante de Cafe",
    description: "Exfoliacion energizante con cafe de comercio justo.",
    price: 20000,
    category: ProductCategory.Soap,
    ingredients: ["aceite de oliva", "cafe molido"],
    organicIngredients: ["aceite de oliva", "cafe molido"],
    recommendedSkinType: SkinType.Oily,
    stock: 7,
    batch: "LOT-CFE-01",
    color1: "#c8a98a",
    color2: "#9c7a56",
    emoji: "☕",
  },
];

function svgImage(seed: ProductSeed): string {
  const safeName = seed.name.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${seed.color1}'/>
        <stop offset='1' stop-color='${seed.color2}'/>
      </linearGradient>
    </defs>
    <rect width='400' height='300' fill='url(#g)'/>
    <circle cx='200' cy='130' r='72' fill='#ffffff' opacity='0.85'/>
    <text x='200' y='162' font-size='72' text-anchor='middle'>${seed.emoji}</text>
    <text x='200' y='250' font-size='22' font-family='Segoe UI, sans-serif' font-weight='bold' fill='#2c2a26' text-anchor='middle'>${safeName}</text>
  </svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg.trim());
}

export const PRODUCT_IMAGES: Record<string, string> = Object.fromEntries(
  SEEDS.map((s) => [s.id, svgImage(s)]),
);

export function buildSampleProducts(): Product[] {
  return SEEDS.map((s) => {
    const props: Partial<ProductProps> & Pick<ProductProps, "id" | "name" | "price"> = {
      id: s.id,
      name: s.name,
      description: s.description,
      price: Money.of(s.price),
      category: s.category,
      ingredients: s.ingredients,
      organicIngredients: s.organicIngredients,
      recommendedSkinType: s.recommendedSkinType,
      handmade: true,
      stock: s.stock,
      batch: s.batch,
      active: true,
      createdAt: new Date(),
    };
    return Product.create(props as ProductProps);
  });
}

export const DEFAULT_CUSTOMER_ID = "c1";
