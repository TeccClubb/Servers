import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcrypt";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only admins can access other user details
    // Regular users can only access their own details
    if (session.user.role !== "ADMIN" && session.user.id !== params.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!params.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: {
        id: params.userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        serverAccess: {
          include: {
            server: {
              select: {
                id: true,
                name: true,
                ip: true,
                domain: true,
                country: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only admins can update other users
    // Regular users can only update their own details
    if (session.user.role !== "ADMIN" && session.user.id !== params.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!params.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const body = await req.json();

    const { name, email, password, role } = body;

    // Only admins can update role
    if (role && session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden: Cannot update role", { status: 403 });
    }

    // Create update data object
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.hashedPassword = await bcrypt.hash(password, 12);
    if (role && session.user.role === "ADMIN") updateData.role = role;

    const user = await prismadb.user.update({
      where: {
        id: params.userId
      },
      data: updateData
    });

    // Don't return hashed password
    const { hashedPassword, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only admins can delete users
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    if (!params.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Check if trying to delete the last admin
    const adminCount = await prismadb.user.count({
      where: {
        role: "ADMIN"
      }
    });

    const userToDelete = await prismadb.user.findUnique({
      where: {
        id: params.userId
      }
    });

    if (adminCount <= 1 && userToDelete?.role === "ADMIN") {
      return new NextResponse("Cannot delete the last admin user", { status: 400 });
    }

    await prismadb.user.delete({
      where: {
        id: params.userId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}