// pages/api/products.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Product = { id: number; name: string; price: number };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product[]>
) {
  res.status(200).json([
    { id: 1, name: "Laptop", price: 1200 },
    { id: 2, name: "Phone", price: 800 },
    { id: 3, name: "Headphones", price: 150 },
  ]);
}
