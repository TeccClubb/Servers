import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

// GET all server access permissions (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const user = await prismadb.user.findUnique({
      where: { email: session.user?.email! }
    });
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    
    const isAdmin = 'role' in user && user.role === "ADMIN";
    
    if (!isAdmin) {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    // Try to use the Prisma client model if it exists
    let serverAccess;
    
    try {
      // Check if serverAccess model is available
      if ('serverAccess' in prismadb) {
        // @ts-ignore
        serverAccess = await prismadb.serverAccess.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            server: {
              select: {
                id: true,
                name: true,
                ip: true,
                domain: true
              }
            }
          }
        });
      } else {
        // Fallback to raw SQL query
        serverAccess = await prismadb.$queryRaw`
          SELECT sa.*, 
            u.id as user_id, u.name as user_name, u.email as user_email,
            s.id as server_id, s.name as server_name, s.ip as server_ip, s.domain as server_domain
          FROM "ServerAccess" sa
          JOIN "User" u ON sa.userId = u.id
          JOIN "Server" s ON sa.serverId = s.id
        `;
      }
    } catch (error) {
      // Table might not exist yet
      console.error("Error accessing ServerAccess:", error);
      serverAccess = [];
    }

    return NextResponse.json(serverAccess);
  } catch (error) {
    console.error("[SERVER_ACCESS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST to create a new server access permission (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prismadb.user.findUnique({
      where: { email: session.user?.email! }
    });
    
    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }
    
    const isAdmin = 'role' in currentUser && currentUser.role === "ADMIN";
    
    if (!isAdmin) {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    const body = await req.json();
    
    const { 
      userId, 
      serverId, 
      canViewPassword = false, 
      canViewPrivateKey = false, 
      canRunSpeedTest = true, 
      canRunHealthCheck = true 
    } = body;

    if (!userId || !serverId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user and server exist
    const user = await prismadb.user.findUnique({
      where: { id: userId }
    });

    const server = await prismadb.server.findUnique({
      where: { id: serverId }
    });

    if (!user || !server) {
      return new NextResponse("User or Server not found", { status: 404 });
    }

    // Check if this access already exists
    let existingAccess = null;
    let serverAccess = null;
    
    try {
      // Try to use Prisma client if available
      if ('serverAccess' in prismadb) {
        // @ts-ignore
        existingAccess = await prismadb.serverAccess.findFirst({
          where: {
            userId,
            serverId
          }
        });
        
        if (existingAccess) {
          return new NextResponse("Access already exists", { status: 400 });
        }
        
        // @ts-ignore
        serverAccess = await prismadb.serverAccess.create({
          data: {
            userId,
            serverId,
            canViewPassword,
            canViewPrivateKey,
            canRunSpeedTest,
            canRunHealthCheck
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            server: {
              select: {
                id: true,
                name: true,
                ip: true,
                domain: true
              }
            }
          }
        });
      } else {
        // Fall back to raw SQL
        const checkAccess = await prismadb.$queryRaw`
          SELECT * FROM "ServerAccess"
          WHERE "userId" = ${userId} AND "serverId" = ${serverId}
          LIMIT 1
        `;
        
        if (Array.isArray(checkAccess) && checkAccess.length > 0) {
          return new NextResponse("Access already exists", { status: 400 });
        }
        
        // Use raw SQL to create the access
        await prismadb.$executeRaw`
          INSERT INTO "ServerAccess" 
          ("id", "userId", "serverId", "canViewPassword", "canViewPrivateKey", "canRunSpeedTest", "canRunHealthCheck", "createdAt", "updatedAt")
          VALUES 
          (uuid(), ${userId}, ${serverId}, ${canViewPassword}, ${canViewPrivateKey}, ${canRunSpeedTest}, ${canRunHealthCheck}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        // Fetch the created record
        serverAccess = await prismadb.$queryRaw`
          SELECT sa.*, 
            u.id as user_id, u.name as user_name, u.email as user_email,
            s.id as server_id, s.name as server_name, s.ip as server_ip, s.domain as server_domain
          FROM "ServerAccess" sa
          JOIN "User" u ON sa.userId = u.id
          JOIN "Server" s ON sa.serverId = s.id
          WHERE sa."userId" = ${userId} AND sa."serverId" = ${serverId}
          LIMIT 1
        `;
      }
    } catch (error) {
      // Table might not exist, try to create it
      console.error("Error with ServerAccess operations:", error);
      
      try {
        // Create the table if it doesn't exist
        await prismadb.$executeRaw`
          CREATE TABLE IF NOT EXISTS "ServerAccess" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "serverId" TEXT NOT NULL,
            "canViewPassword" BOOLEAN NOT NULL DEFAULT false,
            "canViewPrivateKey" BOOLEAN NOT NULL DEFAULT false,
            "canRunSpeedTest" BOOLEAN NOT NULL DEFAULT true,
            "canRunHealthCheck" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL,
            CONSTRAINT "ServerAccess_userId_serverId_key" UNIQUE ("userId", "serverId"),
            CONSTRAINT "ServerAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "ServerAccess_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
          )
        `;
        
        // Now try to insert the record
        await prismadb.$executeRaw`
          INSERT INTO "ServerAccess" 
          ("id", "userId", "serverId", "canViewPassword", "canViewPrivateKey", "canRunSpeedTest", "canRunHealthCheck", "createdAt", "updatedAt")
          VALUES 
          (uuid(), ${userId}, ${serverId}, ${canViewPassword}, ${canViewPrivateKey}, ${canRunSpeedTest}, ${canRunHealthCheck}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        // And fetch it
        serverAccess = await prismadb.$queryRaw`
          SELECT sa.*, 
            u.id as user_id, u.name as user_name, u.email as user_email,
            s.id as server_id, s.name as server_name, s.ip as server_ip, s.domain as server_domain
          FROM "ServerAccess" sa
          JOIN "User" u ON sa.userId = u.id
          JOIN "Server" s ON sa.serverId = s.id
          WHERE sa."userId" = ${userId} AND sa."serverId" = ${serverId}
          LIMIT 1
        `;
      } catch (createError) {
        console.error("Failed to create ServerAccess table:", createError);
        throw new Error("Failed to create or access ServerAccess table");
      }
    }

    return NextResponse.json(serverAccess);
  } catch (error) {
    console.error("[SERVER_ACCESS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}