// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../_utils/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true, // 👈 añadimos username
        password: true,
        balance: true,
        address: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(401).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username }, // 👈 incluimos username en el JWT
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );

    // No devolvemos password
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username, // 👈 lo devolvemos en la respuesta
        balance: user.balance,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
