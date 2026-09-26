import "reflect-metadata";
import path from "path";
import express, { Request, Response } from "express";
import { Money } from "../shared/domain/Money";
import { ProductCategory, SkinType } from "../shared/domain/SkinType";

import { InMemoryProductRepository } from "../catalog/infrastructure/InMemoryProductRepository";
import { ListProducts } from "../catalog/domain/usecases/ListProducts";
import { FilterProducts } from "../catalog/domain/usecases/FilterProducts";

import { InMemoryCartRepository } from "../cart/infrastructure/InMemoryCartRepository";
import { AddItemToCart } from "../cart/domain/usecases/AddItemToCart";
import { GetCart } from "../cart/domain/usecases/GetCart";
import { RemoveItemFromCart } from "../cart/domain/usecases/RemoveItemFromCart";

import { InMemoryCustomerRepository } from "../customers/infrastructure/InMemoryCustomerRepository";
import { Customer } from "../customers/domain/entities/Customer";
import { InMemoryOrderRepository } from "../checkout/infrastructure/InMemoryOrderRepository";
import { MockPaymentGateway } from "../checkout/infrastructure/MockPaymentGateway";
import { ProcessCheckout } from "../checkout/domain/usecases/ProcessCheckout";

import { buildSampleProducts, DEFAULT_CUSTOMER_ID, PRODUCT_IMAGES } from "./seed";

function moneyToJson(m: Money) {
  return { amount: m.getAmount(), currency: m.getCurrency() };
}

function bootstrap() {
  const productRepo = new InMemoryProductRepository();
  const cartRepo = new InMemoryCartRepository();
  const customerRepo = new InMemoryCustomerRepository();
  const orderRepo = new InMemoryOrderRepository();
  const payment = new MockPaymentGateway();

  for (const p of buildSampleProducts()) {
    void productRepo.save(p);
  }
  void customerRepo.save(
    Customer.create({
      id: DEFAULT_CUSTOMER_ID,
      fullName: "Cliente Demo",
      email: "cliente@soap.example",
      shippingAddress: "Calle 1 # 2-3, Bogota",
    }),
  );

  const listProducts = new ListProducts(productRepo);
  const filterProducts = new FilterProducts(productRepo);
  const addItemToCart = new AddItemToCart(cartRepo, productRepo);
  const getCart = new GetCart(cartRepo);
  const removeItemFromCart = new RemoveItemFromCart(cartRepo);
  const processCheckout = new ProcessCheckout(
    cartRepo,
    customerRepo,
    orderRepo,
    payment,
  );

  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "..", "public")));

  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const q = req.query;
      const criteria: import("../catalog/domain/entities/ProductFilterCriteria").ProductFilterCriteria =
        {};
      if (q.category) criteria.category = q.category as ProductCategory;
      if (q.skin) criteria.recommendedSkinType = q.skin as SkinType;
      if (q.handmade === "true") criteria.handmadeOnly = true;
      if (q.organic === "true") criteria.organicOnly = true;
      if (q.available === "true") criteria.inStockOnly = true;
      if (q.search) criteria.searchTerm = String(q.search);
      const hasFilter = Object.keys(criteria).length > 0;
      const result = hasFilter
        ? await filterProducts.execute(criteria)
        : await listProducts.execute({ onlyAvailable: false });

      res.json({
        total: result.total,
        products: result.products.map((p) => ({
          id: p.id,
          name: p.getName(),
          description: p.getDescription(),
          price: moneyToJson(p.getPrice()),
          category: p.getCategory(),
          ingredients: p.getIngredients(),
          organicIngredients: p.getOrganicIngredients(),
          recommendedSkinType: p.getRecommendedSkinType(),
          handmade: p.isHandmade(),
          stock: p.getStock(),
          batch: p.getBatch(),
          available: p.isAvailable(),
          image: PRODUCT_IMAGES[p.id] ?? null,
        })),
      });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  app.post("/api/cart/items", async (req: Request, res: Response) => {
    try {
      const { cartId, productId, quantity } = req.body;
      const cart = await addItemToCart.execute({
        cartId,
        customerId: DEFAULT_CUSTOMER_ID,
        productId,
        quantity: Number(quantity),
      });
      const view = await getCart.execute(cart.id);
      res.json(view);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  app.get("/api/cart/:cartId", async (req: Request, res: Response) => {
    const view = await getCart.execute(req.params.cartId);
    if (!view) {
      res.status(404).json({ error: "Carrito no encontrado." });
      return;
    }
    res.json(view);
  });

  app.delete(
    "/api/cart/:cartId/items/:productId",
    async (req: Request, res: Response) => {
      try {
        const { cartId, productId } = req.params;
        const cart = await removeItemFromCart.execute({ cartId, productId });
        const view = await getCart.execute(cart.id);
        res.json(view);
      } catch (err) {
        res.status(400).json({ error: (err as Error).message });
      }
    },
  );

  app.post("/api/checkout", async (req: Request, res: Response) => {
    try {
      const { cartId } = req.body;
      const result = await processCheckout.execute({
        cartId,
        customerId: DEFAULT_CUSTOMER_ID,
      });
      res.json({
        orderId: result.orderId,
        status: result.status,
        total: moneyToJson(result.total),
        transactionId: result.transactionId,
      });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`Tienda corriendo en http://localhost:${port}`);
  });
}

bootstrap();
