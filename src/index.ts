import "reflect-metadata";
import { Money } from "./shared/domain/Money";
import { Product, ProductProps } from "./catalog/domain/entities/Product";
import { ProductCategory, SkinType } from "./shared/domain/SkinType";
import { InMemoryProductRepository } from "./catalog/infrastructure/InMemoryProductRepository";
import { ListProducts } from "./catalog/domain/usecases/ListProducts";
import { FilterProducts } from "./catalog/domain/usecases/FilterProducts";
import { InMemoryCartRepository } from "./cart/infrastructure/InMemoryCartRepository";
import { AddItemToCart } from "./cart/domain/usecases/AddItemToCart";
import { InMemoryCustomerRepository } from "./customers/infrastructure/InMemoryCustomerRepository";
import { Customer } from "./customers/domain/entities/Customer";
import { InMemoryOrderRepository } from "./checkout/infrastructure/InMemoryOrderRepository";
import { MockPaymentGateway } from "./checkout/infrastructure/MockPaymentGateway";
import { ProcessCheckout } from "./checkout/domain/usecases/ProcessCheckout";

function buildProduct(partial: Partial<ProductProps> & Pick<ProductProps, "id" | "name" | "price">): Product {
  return Product.create({
    id: partial.id,
    name: partial.name,
    description: partial.description ?? "Jabon artesanal de origen natural.",
    price: partial.price,
    category: partial.category ?? ProductCategory.Soap,
    ingredients: partial.ingredients ?? ["aceite de oliva", "manteca de cacao"],
    organicIngredients: partial.organicIngredients ?? ["manteca de cacao"],
    recommendedSkinType: partial.recommendedSkinType ?? SkinType.All,
    handmade: partial.handmade ?? true,
    stock: partial.stock ?? 10,
    batch: partial.batch ?? "LOT-001",
    active: partial.active ?? true,
    createdAt: new Date(),
  });
}

async function main(): Promise<void> {
  const productRepo = new InMemoryProductRepository();
  const cartRepo = new InMemoryCartRepository();
  const customerRepo = new InMemoryCustomerRepository();
  const orderRepo = new InMemoryOrderRepository();
  const payment = new MockPaymentGateway();

  const lavender = buildProduct({
    id: "p1",
    name: "Jabon de Lavanda",
    price: Money.of(18000),
    recommendedSkinType: SkinType.Sensitive,
    stock: 5,
    batch: "LOT-LAV-01",
  });
  const charcoal = buildProduct({
    id: "p2",
    name: "Jabon de Carbon Activado",
    price: Money.of(22000),
    recommendedSkinType: SkinType.Oily,
    stock: 0,
    batch: "LOT-CAR-01",
  });
  await productRepo.save(lavender);
  await productRepo.save(charcoal);

  await customerRepo.save(
    Customer.create({
      id: "c1",
      fullName: "Juan Meza",
      email: "juan@example.com",
      shippingAddress: "Calle 1 # 2-3, Bogota",
    }),
  );

  const list = new ListProducts(productRepo);
  const all = await list.execute();
  console.log(`Productos registrados: ${all.total}`);

  const filter = new FilterProducts(productRepo);
  const sensitive = await filter.execute({
    recommendedSkinType: SkinType.Sensitive,
  });
  console.log(`Filtro piel sensible: ${sensitive.total} resultado(s)`);

  const addItem = new AddItemToCart(cartRepo, productRepo);
  const cart = await addItem.execute({
    cartId: "cart-1",
    customerId: "c1",
    productId: "p1",
    quantity: 2,
  });
  console.log(`Carrito total: ${cart.total().getAmount()} ${cart.total().getCurrency()}`);

  try {
    await addItem.execute({
      cartId: "cart-1",
      customerId: "c1",
      productId: "p2",
      quantity: 1,
    });
  } catch (err) {
    console.log(`Validacion de stock: ${(err as Error).message}`);
  }

  const checkout = new ProcessCheckout(cartRepo, customerRepo, orderRepo, payment);
  const result = await checkout.execute({ cartId: "cart-1", customerId: "c1" });
  console.log(
    `Orden ${result.orderId} -> estado: ${result.status}, txn: ${result.transactionId ?? "N/A"}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
