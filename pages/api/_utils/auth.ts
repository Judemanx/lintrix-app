// pages/api/_utils/auth.ts
import jwt from "jsonwebtoken";

export function verifyToken(token?: string) {
  if (!token) return null;
  try {
    const cleaned = token.startsWith("Bearer ") ? token.slice(7) : token;
    const payload = jwt.verify(cleaned, process.env.JWT_SECRET || "devsecret");
    return payload as any;
  } catch {
    return null;
  }
}
