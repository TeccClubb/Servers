import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcrypt";

// GET all users (for admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    const users = await prismadb.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST to create a new user (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    const body = await req.json();

    const { name, email, password, role = "USER" } = body;

    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prismadb.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prismadb.user.create({
      data: {
        name,
        email,
        role,
        hashedPassword,
      }
    });

    // Return the user without the password
    const { hashedPassword: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("[USERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}