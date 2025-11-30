import { getAuthToken, verifyToken } from "@/lib/jwt";
import { ApiResponse } from "@/lib/api-response";

// Cek apakah user authenticated
export async function getAuthenticatedUser() {
  const token = await getAuthToken();
  if (!token) return null;

  const payload = await verifyToken(token);
  return payload; // Return user data dari token
}

// Middleware helper untuk API routes
export async function requireAuth() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return ApiResponse.unauthorized();
  }
  return user; // Return user jika valid
}