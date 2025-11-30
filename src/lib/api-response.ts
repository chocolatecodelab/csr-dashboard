import { NextResponse } from "next/server";

export class ApiResponse {
  // Response sukses
  static success(data: any, message?: string, status = 200) {
    return NextResponse.json(
      {
        success: true,
        message: message || "Operation successful",
        data,
      },
      { status }
    );
  }

  // Response error
  static error(message: string, status = 400, details?: any) {
    return NextResponse.json(
      {
        success: false,
        message,
        details,
      },
      { status }
    );
  }

  // Response unauthorized
  static unauthorized(message = "Unauthorized") {
    return this.error(message, 401);
  }

  // Response not found
  static notFound(message = "Resource not found") {
    return this.error(message, 404);
  }

  // Response server error
  static serverError(message = "Internal server error") {
    return this.error(message, 500);
  }
}