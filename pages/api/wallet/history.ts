import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../_utils/prisma";
import { verifyToken } from "../_utils/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization as string | undefined;
    const payload = verifyToken(authHeader);

    if (!payload || !(payload as any).id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = (payload as any).id as string;

    // 🔹 Buscar usuario autenticado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, address: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔹 Buscar todas las transacciones donde el usuario es remitente o receptor
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ fromId: userId }, { toId: userId }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        status: true,
        type: true, // DEPOSIT | WITHDRAW | TRANSFER
        createdAt: true,
        from: { select: { id: true, email: true, address: true } },
        to: { select: { id: true, email: true, address: true } },
      },
    });

    // 🔹 Enriquecer datos
    const enriched = transactions.map((tx) => {
      let direction: "IN" | "OUT" | "SELF" | null = null;

      if (tx.type === "DEPOSIT") direction = "IN";
      else if (tx.type === "WITHDRAW") direction = "OUT";
      else if (tx.type === "TRANSFER") {
        if (tx.from?.id === userId && tx.to?.id === userId) direction = "SELF";
        else if (tx.from?.id === userId) direction = "OUT";
        else if (tx.to?.id === userId) direction = "IN";
      }

      return {
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        createdAt: tx.createdAt,
        direction,
        from: tx.from
          ? { id: tx.from.id, email: tx.from.email, address: tx.from.address }
          : { id: "system", email: "System", address: null },
        to: tx.to
          ? { id: tx.to.id, email: tx.to.email, address: tx.to.address }
          : { id: "external", email: "External Wallet", address: null },
      };
    });

    return res.status(200).json({
      userId,
      userEmail: user.email,
      userAddress: user.address,
      transactions: enriched,
    });
  } catch (err: any) {
    console.error("[history] error:", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: String(err?.message || err),
    });
  }
}
