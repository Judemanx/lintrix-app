// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../_utils/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    console.log("[register] incoming body:", JSON.stringify(req.body));

    const { email, password, address, username } = req.body ?? {};

    if (!email || !password || !address || !username) {
      return res.status(400).json({ error: "Email, password, address and username are required" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { address }, { username }] },
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "User with this email, address or username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        address,
        username,
        balance: 0,
      },
      select: {
        id: true,
        email: true,
        username: true,
        balance: true,
        address: true,
        createdAt: true,
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "devsecret", {
      expiresIn: "7d",
    });

    return res.status(201).json({ token, user });
  } catch (err: any) {
    console.error("Register error:", err);
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Duplicate value (email, address or username already exists)" });
    }
    return res.status(500).json({ error: "Internal server error", detail: String(err?.message || err) });
  }
}
