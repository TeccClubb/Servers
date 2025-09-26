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
            // For regular users, only get servers they have access to with canRunSpeedTest permission
            const serverAccesses = await prismadb.serverAccess.findMany({
                where: {
                    userId: user.id,
                    canRunSpeedTest: true
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

        // Process servers one by one to avoid overwhelming the system
        for (const server of servers) {
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
                    console.error(`Failed to test server ${server.ip}: ${response.statusText}`);
                    continue;
                }

                const data = await response.json();

                // Create a new speed test entry in the database
                await prismadb.speedTest.create({
                    data: {
                        serverId: server.id,
                        downloadSpeed: data.download_mbps,
                        uploadSpeed: data.upload_mbps,
                        ping: data.ping_ms,
                    }
                });

                // Update server status and last checked timestamp
                await prismadb.server.update({
                    where: {
                        id: server.id
                    },
                    data: {
                        status: "ACTIVE",
                        lastChecked: new Date()
                    }
                });

                completed++;
            } catch (error) {
                console.error(`Error testing server ${server.ip}:`, error);

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
            }
        }

        return NextResponse.json({
            message: `Speed test completed for ${completed} of ${servers.length} servers you have access to`,
            completed
        });
    } catch (error) {
        console.error("[SPEEDTEST_ALL_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}