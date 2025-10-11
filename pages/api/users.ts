// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from "next";

type User = { id: number; name: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<User[]>
) {
  res.status(200).json([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
  ]);
}
