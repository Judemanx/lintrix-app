// pages/api/wallet/withdraw.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../_utils/prisma";
import { verifyToken } from "../_utils/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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

    // Validar fondos locales (off-chain)
    if (user.balance < numericAmount) {
      return res.status(400).json({ error: "Insufficient off-chain balance" });
    }

    // 🔹 Descontar balance local
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: numericAmount } },
      select: { id: true, email: true, balance: true, address: true },
    });

    // 🔹 Registrar transacción en historial local
    await prisma.transaction.create({
      data: {
        fromId: userId,
        toId: null,
        amount: numericAmount,
        status: "SUCCESS",
        type: "WITHDRAW",
      },
    });

    // 🔹 Enviar respuesta al frontend
    return res.status(200).json({
      message: "✅ Withdrawal successful (off-chain simulation)",
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("[withdraw] error:", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: String(err?.message || err),
    });
  }
}
