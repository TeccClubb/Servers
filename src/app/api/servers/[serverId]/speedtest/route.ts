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
      // Call the VPS API endpoint for speed test
      const apiUrl = `http://${server.ip}:5001/api/vps-speedtest`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Set a reasonable timeout
        signal: AbortSignal.timeout(150000),
      });

      if (!response.ok) {
        throw new Error(`Failed to test server: ${response.statusText}`);
      }

      const data = await response.json();

      // Create a new speed test entry in the database
      const speedTest = await prismadb.speedTest.create({
        data: {
          serverId: params.serverId,
          downloadSpeed: data.download_mbps,
          uploadSpeed: data.upload_mbps,
          ping: data.ping_ms,
        }
      });

      // Update server status to ACTIVE if speed test successful
      await prismadb.server.update({
        where: {
          id: params.serverId
        },
        data: {
          status: "ACTIVE",
          lastChecked: new Date()
        }
      });

      return NextResponse.json(speedTest);
    } catch (error) {
      console.error(`Error testing server:`, error);

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

      return new NextResponse("Failed to run speed test", { status: 500 });
    }
  } catch (error) {
    console.error("[SPEEDTEST_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}