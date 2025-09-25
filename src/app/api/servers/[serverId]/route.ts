import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID is required", { status: 400 });
    }

    // Get the user information
    const user = await prismadb.user.findUnique({
      where: {
        email: session.user?.email!
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    
    // Get server information
    const server = await prismadb.server.findUnique({
      where: {
        id: params.serverId
      },
      include: {
        healthMetrics: {
          orderBy: {
            timestamp: "desc"
          },
          take: 10
        },
        speedTests: {
          orderBy: {
            timestamp: "desc"
          },
          take: 10
        }
      }
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    // Check for admin access
    // The User model in the database may or may not have the role field yet
    const isAdmin = 'role' in user && user.role === "ADMIN";
    
    if (isAdmin) {
      // Admin gets full access
      return NextResponse.json({
        ...server,
        hasAccess: true,
        canViewPassword: true,
        canViewPrivateKey: true,
        canRunSpeedTest: true,
        canRunHealthCheck: true
      });
    }

    // Check if we need to migrate the schema to add ServerAccess
    try {
      // For regular users, check their access permissions
      // If the table exists, this will work
      const serverAccess = await prismadb.$queryRaw`
        SELECT * FROM "ServerAccess" 
        WHERE "userId" = ${user.id} 
        AND "serverId" = ${params.serverId}
        LIMIT 1
      `;
      
      // If we have access records, use those permissions
      if (Array.isArray(serverAccess) && serverAccess.length > 0) {
        const access = serverAccess[0] as any;
        return NextResponse.json({
          ...server,
          hasAccess: true,
          canViewPassword: !!access.canViewPassword,
          canViewPrivateKey: !!access.canViewPrivateKey,
          canRunSpeedTest: !!access.canRunSpeedTest,
          canRunHealthCheck: !!access.canRunHealthCheck
        });
      }
    } catch (error) {
      // If the table doesn't exist yet, we'll get an error
      console.warn("ServerAccess table might not exist yet:", error);
    }
    
    // Default: no specific permissions set, provide read-only access
    return NextResponse.json({
      ...server,
      hasAccess: true,
      canViewPassword: false,
      canViewPrivateKey: false,
      canRunSpeedTest: true,
      canRunHealthCheck: true
    });
  } catch (error) {
    console.error("[SERVER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID is required", { status: 400 });
    }

    // Get the user information
    const user = await prismadb.user.findUnique({
      where: {
        email: session.user?.email!
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Only admins can update server details
    const isAdmin = 'role' in user && user.role === "ADMIN";
    
    if (!isAdmin) {
      return new NextResponse("Permission denied", { status: 403 });
    }

    const body = await req.json();
    
    const { name, ip, domain, country, username, password, privateKey, status } = body;

    const server = await prismadb.server.update({
      where: {
        id: params.serverId
      },
      data: {
        name,
        ip,
        domain,
        country,
        username,
        password,
        privateKey,
        status,
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[SERVER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID is required", { status: 400 });
    }

    // Get the user information
    const user = await prismadb.user.findUnique({
      where: {
        email: session.user?.email!
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Only admins can delete servers
    const isAdmin = 'role' in user && user.role === "ADMIN";
    
    if (!isAdmin) {
      return new NextResponse("Permission denied", { status: 403 });
    }

    const server = await prismadb.server.delete({
      where: {
        id: params.serverId
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[SERVER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}