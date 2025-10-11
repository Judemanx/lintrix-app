// pages/api/wallet/deposit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../_utils/prisma";
import { verifyToken } from "../_utils/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization as string | undefined;
    const payload = verifyToken(authHeader);
    if (!payload || !(payload as any).id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = (payload as any).id as string;
    const { amount } = req.body ?? {};
    const numericAmount = Number(amount);

    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🔹 Incrementar balance local (off-chain)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: numericAmount } },
      select: { id: true, email: true, balance: true },
    });

    // 🔹 Registrar transacción local
    await prisma.transaction.create({
      data: {
        fromId: null,
        toId: userId,
        amount: numericAmount,
        status: "SUCCESS",
        type: "DEPOSIT",
      },
    });

    return res.status(200).json({
      message: "✅ Deposit successful (off-chain only)",
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("[deposit] error:", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: String(err?.message || err),
    });
  }
}
