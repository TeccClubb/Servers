import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Get the current user
    const user = await prismadb.user.findUnique({
      where: {
        email: session.user?.email!
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user is admin
    const isAdmin = user.role === "ADMIN";
    
    let servers;
    
    // Admins can access all servers
    if (isAdmin) {
      servers = await prismadb.server.findMany({
        select: {
          id: true,
          ip: true
        }
      });
    } else {
      // For regular users, only get servers they have access to with canRunHealthCheck permission
      const serverAccesses = await prismadb.serverAccess.findMany({
        where: {
          userId: user.id,
          canRunHealthCheck: true
        },
        select: {
          serverId: true
        }
      });
      
      // Get the list of server IDs the user has access to
      const serverIds = serverAccesses.map(access => access.serverId);
      
      // Get the servers the user has access to
      servers = await prismadb.server.findMany({
        where: {
          id: {
            in: serverIds
          }
        },
        select: {
          id: true,
          ip: true
        }
      });
    }

    if (!servers || servers.length === 0) {
      return NextResponse.json({ message: "No servers found", completed: 0 });
    }

    let completed = 0;
    let healthy = 0;
    let maintenance = 0;
    let inactive = 0;

    // Process servers one by one
    for (const server of servers) {
      try {
        // Call the VPS API endpoint for health check
        const apiUrl = `http://${server.ip}:5001/api/vps-health`;
        
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Set a reasonable timeout
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          throw new Error(`Failed to check server health: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Create a new health metric entry in the database
        await prismadb.healthMetric.create({
          data: {
            serverId: server.id,
            cpuUsage: data.cpu_usage_percentage,
            memoryUsage: data.ram_usage_percentage,
            diskUsage: data.disk_usage_percentage,
            uptime: data.health_score, // We'll store health score in uptime field
          }
        });

        // Update server status based on health check
        const status = data.status === "healthy" ? "ACTIVE" : "MAINTENANCE";
        
        await prismadb.server.update({
          where: {
            id: server.id
          },
          data: {
            status,
            lastChecked: new Date()
          }
        });

        if (status === "ACTIVE") healthy++;
        else maintenance++;

        completed++;
      } catch (error) {
        console.error(`Error checking server health for ${server.ip}:`, error);
        
        // Mark server as inactive if we can't reach it
        await prismadb.server.update({
          where: {
            id: server.id
          },
          data: {
            status: "INACTIVE",
            lastChecked: new Date()
          }
        });
        
        inactive++;
      }
    }

    return NextResponse.json({ 
      message: `Health check completed for ${completed} of ${servers.length} servers you have access to`,
      completed,
      stats: {
        healthy,
        maintenance,
        inactive
      }
    });
  } catch (error) {
    console.error("[HEALTH_CHECK_ALL_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}