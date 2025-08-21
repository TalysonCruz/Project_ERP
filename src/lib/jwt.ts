import jwt from "jsonwebtoken";

export interface JwtPayload {
  userID: number;
  name: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET não definido no .env.local");

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}
