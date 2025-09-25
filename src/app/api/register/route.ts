import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prismadb from "@/lib/prismadb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const exists = await prismadb.user.findUnique({
      where: {
        email
      }
    });

    if (exists) {
      return new NextResponse("Email already in use", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prismadb.user.create({
      data: {
        name,
        email,
        hashedPassword
      }
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error("[REGISTER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}