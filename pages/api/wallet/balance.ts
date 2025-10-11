import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../_utils/prisma";
import { verifyToken } from "../_utils/auth";
import { ethers } from "ethers";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

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

    // 🔹 Buscar usuario en BD
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, address: true, balance: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🔹 Conectar a la blockchain solo para leer
    let formattedBalance = 0;
    if (user.address) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
        const sdk = new ThirdwebSDK(provider);
        const contract = await sdk.getContract(process.env.CONTRACT_ADDRESS!, "token");
        const onChainBalance = await contract.erc20.balanceOf(user.address);
        const decimals = Number(process.env.TOKEN_DECIMALS || 18);
        formattedBalance = Number(ethers.utils.formatUnits(onChainBalance.value, decimals));
      } catch (err) {
        console.warn("[balance] couldn't fetch on-chain:", err);
      }
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      address: user.address,
      localBalance: user.balance,
      onChainBalance: formattedBalance,
    });
  } catch (err: any) {
    console.error("[balance] error:", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: String(err?.message || err),
    });
  }
}
