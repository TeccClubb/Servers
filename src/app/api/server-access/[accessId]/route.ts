import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { accessId: string } }
) {
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

    if (!params.accessId) {
      return new NextResponse("Access ID is required", { status: 400 });
    }

    // Try to use Prisma client if available
    let serverAccess = null;
    
    try {
      if ('serverAccess' in prismadb) {
        // @ts-ignore
        serverAccess = await prismadb.serverAccess.findUnique({
          where: {
            id: params.accessId
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
        // Fallback to raw SQL
        const results = await prismadb.$queryRaw`
          SELECT sa.*, 
            u.id as user_id, u.name as user_name, u.email as user_email,
            s.id as server_id, s.name as server_name, s.ip as server_ip, s.domain as server_domain
          FROM "ServerAccess" sa
          JOIN "User" u ON sa.userId = u.id
          JOIN "Server" s ON sa.serverId = s.id
          WHERE sa.id = ${params.accessId}
          LIMIT 1
        `;
        
        if (Array.isArray(results) && results.length > 0) {
          const result = results[0] as any;
          serverAccess = {
            ...result,
            user: {
              id: result.user_id,
              name: result.user_name,
              email: result.user_email
            },
            server: {
              id: result.server_id,
              name: result.server_name,
              ip: result.server_ip,
              domain: result.server_domain
            }
          };
        }
      }
    } catch (error) {
      console.error("Error fetching ServerAccess:", error);
      return new NextResponse("Error fetching server access", { status: 500 });
    }

    if (!serverAccess) {
      return new NextResponse("Server access not found", { status: 404 });
    }

    return NextResponse.json(serverAccess);
  } catch (error) {
    console.error("[SERVER_ACCESS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { accessId: string } }
) {
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

    if (!params.accessId) {
      return new NextResponse("Access ID is required", { status: 400 });
    }

    const body = await req.json();
    
    const { 
      canViewPassword, 
      canViewPrivateKey, 
      canRunSpeedTest, 
      canRunHealthCheck 
    } = body;

    const updateData: any = {};
    if (typeof canViewPassword === 'boolean') updateData.canViewPassword = canViewPassword;
    if (typeof canViewPrivateKey === 'boolean') updateData.canViewPrivateKey = canViewPrivateKey;
    if (typeof canRunSpeedTest === 'boolean') updateData.canRunSpeedTest = canRunSpeedTest;
    if (typeof canRunHealthCheck === 'boolean') updateData.canRunHealthCheck = canRunHealthCheck;

    // Try to use Prisma client if available
    let serverAccess = null;
    
    try {
      if ('serverAccess' in prismadb) {
        // @ts-ignore
        serverAccess = await prismadb.serverAccess.update({
          where: {
            id: params.accessId
          },
          data: updateData,
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
        // Get user and server IDs for the access record
        const accessRecord = await prismadb.$queryRaw`
          SELECT * FROM "ServerAccess" 
          WHERE id = ${params.accessId}
          LIMIT 1
        `;
        
        if (!Array.isArray(accessRecord) || accessRecord.length === 0) {
          return new NextResponse("Server access not found", { status: 404 });
        }
        
        // Build the SET clause for the SQL update
        const setClauses = [];
        if ('canViewPassword' in updateData) {
          setClauses.push(`"canViewPassword" = ${updateData.canViewPassword ? 1 : 0}`);
        }
        if ('canViewPrivateKey' in updateData) {
          setClauses.push(`"canViewPrivateKey" = ${updateData.canViewPrivateKey ? 1 : 0}`);
        }
        if ('canRunSpeedTest' in updateData) {
          setClauses.push(`"canRunSpeedTest" = ${updateData.canRunSpeedTest ? 1 : 0}`);
        }
        if ('canRunHealthCheck' in updateData) {
          setClauses.push(`"canRunHealthCheck" = ${updateData.canRunHealthCheck ? 1 : 0}`);
        }
        setClauses.push(`"updatedAt" = CURRENT_TIMESTAMP`);
        
        // Update the record
        if (setClauses.length > 0) {
          // Need to build the SQL statement and execute it
          const sqlStatement = `
            UPDATE "ServerAccess"
            SET ${setClauses.join(', ')}
            WHERE id = ?
          `;
          
          await prismadb.$executeRaw(
            Prisma.raw(sqlStatement),
            params.accessId
          );
        }
        
        // Fetch the updated record
        const results = await prismadb.$queryRaw`
          SELECT sa.*, 
            u.id as user_id, u.name as user_name, u.email as user_email,
            s.id as server_id, s.name as server_name, s.ip as server_ip, s.domain as server_domain
          FROM "ServerAccess" sa
          JOIN "User" u ON sa.userId = u.id
          JOIN "Server" s ON sa.serverId = s.id
          WHERE sa.id = ${params.accessId}
          LIMIT 1
        `;
        
        if (Array.isArray(results) && results.length > 0) {
          const result = results[0] as any;
          serverAccess = {
            ...result,
            user: {
              id: result.user_id,
              name: result.user_name,
              email: result.user_email
            },
            server: {
              id: result.server_id,
              name: result.server_name,
              ip: result.server_ip,
              domain: result.server_domain
            }
          };
        }
      }
    } catch (error) {
      console.error("Error updating ServerAccess:", error);
      return new NextResponse("Error updating server access", { status: 500 });
    }

    return NextResponse.json(serverAccess);
  } catch (error) {
    console.error("[SERVER_ACCESS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { accessId: string } }
) {
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

    if (!params.accessId) {
      return new NextResponse("Access ID is required", { status: 400 });
    }

    try {
      if ('serverAccess' in prismadb) {
        // @ts-ignore
        await prismadb.serverAccess.delete({
          where: {
            id: params.accessId
          }
        });
      } else {
        // Fallback to raw SQL
        await prismadb.$executeRaw`
          DELETE FROM "ServerAccess" 
          WHERE id = ${params.accessId}
        `;
      }
    } catch (error) {
      console.error("Error deleting ServerAccess:", error);
      return new NextResponse("Error deleting server access", { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SERVER_ACCESS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}