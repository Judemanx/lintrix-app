import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../_utils/prisma";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const { to, amount } = req.body ?? {};
    const numericAmount = Number(amount);

    if (!to || !numericAmount) return res.status(400).json({ error: "'to' and 'amount' are required" });
    if (numericAmount <= 0) return res.status(400).json({ error: "Amount must be greater than 0" });

    const sender = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!sender) return res.status(404).json({ error: "Sender not found" });
    if (sender.balance < numericAmount) return res.status(400).json({ error: "Insufficient balance" });

    const receiver =
      (await prisma.user.findUnique({ where: { id: to } })) ||
      (await prisma.user.findUnique({ where: { email: to } })) ||
      (await prisma.user.findUnique({ where: { address: to } }));

    if (!receiver) return res.status(404).json({ error: "Receiver not found" });

    // Actualizar balances off-chain en una sola transacción
    const [updatedSender, updatedReceiver] = await prisma.$transaction([
      prisma.user.update({
        where: { id: sender.id },
        data: { balance: sender.balance - numericAmount },
      }),
      prisma.user.update({
        where: { id: receiver.id },
        data: { balance: (receiver.balance ?? 0) + numericAmount },
      }),
    ]);

    // Registrar transacción
    await prisma.transaction.create({
      data: {
        fromId: sender.id,
        toId: receiver.id,
        amount: numericAmount,
        status: "SUCCESS",
        type: "TRANSFER",
      },
    });

    return res.status(200).json({
      message: "✅ Transfer completed (off-chain)",
      from: { id: updatedSender.id, email: updatedSender.email, balance: updatedSender.balance },
      to: { id: updatedReceiver.id, email: updatedReceiver.email },
    });
  } catch (err) {
    console.error("[transfer] error:", err);
    return res.status(500).json({ error: "Internal server error in transfer" });
  }
}
