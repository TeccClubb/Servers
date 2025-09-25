import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import ServerTable from "@/components/dashboard/server-table";
import Link from "next/link";
import { FiPlusCircle } from "react-icons/fi";

export default async function ServersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Check if user is admin
  const user = await prismadb.user.findUnique({
    where: {
      email: session.user?.email!
    }
  });
  
  if (!user) {
    redirect("/login");
  }
  
  const isAdmin = 'role' in user && user.role === "ADMIN";
  
  let servers: any[] = [];
  
  if (isAdmin) {
    // Admin can see all servers
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
    }) as any[];
  } else {
    // Regular users can only see servers they have access to
    try {
      // First, get the user's server access permissions
      let userServerIds = [];
      
      if ('serverAccess' in prismadb) {
        // @ts-ignore - The model exists in the DB but might not be in TS types yet
        const serverAccess = await prismadb.serverAccess.findMany({
          where: {
            userId: user.id
          },
          select: {
            serverId: true
          }
        });
        userServerIds = serverAccess.map(access => access.serverId);
      } else {
        // Fallback to raw SQL
        const results = await prismadb.$queryRaw`
          SELECT "serverId" FROM "ServerAccess"
          WHERE "userId" = ${user.id}
        `;
        
        if (Array.isArray(results)) {
          userServerIds = results.map((result: any) => result.serverId);
        }
      }
      
      // Then, get only the servers the user has access to
      servers = await prismadb.server.findMany({
        where: {
          id: {
            in: userServerIds
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
          }
        }
      }) as any[];
      
      // Create a permissions map
      const permissionsMap: Record<string, any> = {};
      
      // For each server, get permissions from raw SQL
      for (const server of servers) {
        const accessResults = await prismadb.$queryRaw`
          SELECT "canViewPassword", "canViewPrivateKey", "canRunSpeedTest", "canRunHealthCheck"
          FROM "ServerAccess"
          WHERE "userId" = ${user.id} AND "serverId" = ${server.id}
        `;
        
        if (Array.isArray(accessResults) && accessResults.length > 0) {
          permissionsMap[server.id] = accessResults[0];
        }
      }
      
      // Add permissions to servers
      servers = servers.map(server => {
        return {
          ...server,
          userAccess: permissionsMap[server.id] ? [permissionsMap[server.id]] : []
        };
      });
    } catch (error) {
      console.error("Error fetching user's servers:", error);
      servers = [];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Servers</h1>
          <p className="text-muted-foreground">
            Manage your VPS servers
          </p>
        </div>
        {isAdmin && (
          <Link 
            href="/servers/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <FiPlusCircle className="mr-2" />
            Add Server
          </Link>
        )}
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {isAdmin ? (
            <ServerTable servers={servers} isAdmin={true} />
          ) : (
            <ServerTable 
              servers={servers} 
              isAdmin={false} 
              userPermissions={
                Object.fromEntries(
                  servers.map(server => {
                    const access = server.userAccess && server.userAccess.length > 0 ? server.userAccess[0] : null;
                    return [
                      server.id, 
                      {
                        canViewPassword: access?.canViewPassword || false,
                        canViewPrivateKey: access?.canViewPrivateKey || false,
                        canRunSpeedTest: access?.canRunSpeedTest || false,
                        canRunHealthCheck: access?.canRunHealthCheck || false
                      }
                    ];
                  })
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}