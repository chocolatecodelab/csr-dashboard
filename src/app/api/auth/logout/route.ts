export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/api-response";

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully"
      },
      { status: 200 }
    );
    
    // Clear the auth token cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Delete cookie
      path: "/",
    });
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return ApiResponse.serverError("An error occurred during logout");
  }
}
