import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

// Generate token
export async function generateToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

// Verify token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

// Set cookie (reusable)
export async function setAuthCookie(token: string) {
  const cookie = cookies();
  cookie.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 jam
    path: "/",
  });
}

// Get token dari cookie (reusable)
export async function getAuthToken() {
  const cookie = cookies();
    return cookie.get("auth-token")?.value;
}

// Clear cookie (untuk logout)
export async function clearAuthCookie() {
  const cookie = cookies();
  cookie.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}