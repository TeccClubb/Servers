import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

// PATCH to update a user's role (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
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
    const { role } = body;

    if (!role || !["ADMIN", "USER"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Check if trying to downgrade the last admin
    if (role === "USER") {
      // Use raw query to count admins since the role field might not be in the Prisma types yet
      const adminUsers = await prismadb.user.findMany({
        where: {
          // @ts-ignore - role is in the database but might not be in the Prisma types
          role: "ADMIN"
        }
      });

      const adminCount = adminUsers.length;

      const userToUpdate = await prismadb.user.findUnique({
        where: {
          id: params.userId
        }
      });

      // @ts-ignore - role is in the database but might not be in the Prisma types
      if (adminCount <= 1 && userToUpdate?.role === "ADMIN") {
        return new NextResponse("Cannot downgrade the last admin user", { status: 400 });
      }
    }

    const user = await prismadb.user.update({
      where: {
        id: params.userId
      },
      data: {
        // @ts-ignore - role is in the database but might not be in the Prisma types
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        // @ts-ignore - role is in the database but might not be in the Prisma types
        role: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_ROLE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}