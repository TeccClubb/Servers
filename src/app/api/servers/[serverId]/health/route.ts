import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
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
    
    // If not admin, verify user has permission to run health check on this server
    if (!isAdmin) {
      const serverAccess = await prismadb.serverAccess.findUnique({
        where: {
          userId_serverId: {
            userId: user.id,
            serverId: params.serverId
          }
        }
      });
      
      if (!serverAccess || !serverAccess.canRunHealthCheck) {
        return new NextResponse("You don't have permission to run health check on this server", { status: 403 });
      }
    }

    // Get the server IP
    const server = await prismadb.server.findUnique({
      where: {
        id: params.serverId
      },
      select: {
        ip: true
      }
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

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
      const healthMetric = await prismadb.healthMetric.create({
        data: {
          serverId: params.serverId,
          cpuUsage: data.cpu_usage_percentage,
          memoryUsage: data.ram_usage_percentage,
          diskUsage: data.disk_usage_percentage,
          uptime: data.health_score, // We'll store health score in uptime field
        }
      });

      // Update server status based on health check
      await prismadb.server.update({
        where: {
          id: params.serverId
        },
        data: {
          status: data.status === "healthy" ? "ACTIVE" : "MAINTENANCE",
          lastChecked: new Date()
        }
      });

      return NextResponse.json({
        healthMetric,
        healthDetails: data
      });
    } catch (error) {
      console.error(`Error checking server health:`, error);
      
      // Mark server as inactive if we can't reach it
      await prismadb.server.update({
        where: {
          id: params.serverId
        },
        data: {
          status: "INACTIVE",
          lastChecked: new Date()
        }
      });
      
      return new NextResponse("Failed to check server health", { status: 500 });
    }
  } catch (error) {
    console.error("[HEALTH_CHECK_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}