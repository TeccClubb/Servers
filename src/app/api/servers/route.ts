import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // If user is admin, get all servers
    // If regular user, get only servers they have access to
    let servers;

    if (session.user.role === "ADMIN") {
      servers = await prismadb.server.findMany({
        include: {
          healthMetrics: {
            orderBy: {
              timestamp: "desc"
            },
            take: 1
          },
          speedTests: {
            orderBy: {
              timestamp: "desc"
            },
            take: 1
          }
        }
      });
    } else {
      // Get servers the user has access to
      servers = await prismadb.server.findMany({
        where: {
          userAccess: {
            some: {
              userId: session.user.id
            }
          }
        },
        include: {
          healthMetrics: {
            orderBy: {
              timestamp: "desc"
            },
            take: 1
          },
          speedTests: {
            orderBy: {
              timestamp: "desc"
            },
            take: 1
          },
          userAccess: {
            where: {
              userId: session.user.id
            },
            select: {
              canViewPassword: true,
              canViewPrivateKey: true,
              canRunSpeedTest: true,
              canRunHealthCheck: true
            }
          }
        }
      });
    }

    return NextResponse.json(servers);
  } catch (error) {
    console.error("[SERVERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { name, ip, domain, country, username, password, privateKey } = body;

    if (!name || !ip || !country) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const server = await prismadb.server.create({
      data: {
        name,
        ip,
        domain,
        country,
        username,
        password,
        privateKey,
        status: "UNKNOWN"
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[SERVERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}