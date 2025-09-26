import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import AnimatedServerTable from "@/components/dashboard/animated-server-table";
import SpeedTestButtonContainer from "@/components/dashboard/speed-test-button-container";
import HealthCheckButtonContainer from "@/components/dashboard/health-check-button-container";
import AnimatedDashboardMetrics from "@/components/dashboard/animated-metrics";
import AnimatedDashboardLayout, { AnimatedSection } from "@/components/ui/animated-layout";

export default async function DashboardPage() {
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
    });
  } else {
    // Regular users can only see servers they have access to
    try {
      // First, get the user's server access permissions
      let userServerIds: string[] = [];

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
        userServerIds = serverAccess.map((access: any) => access.serverId);
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

  const activeServers = servers.filter((server: any) => server.status === "ACTIVE");
  const inactiveServers = servers.filter((server: any) => server.status !== "ACTIVE");

  // Calculate average health
  const averageHealth = servers.length > 0
    ? servers.reduce((acc: number, server: any) => {
      // For this example, assume health is calculated from CPU, memory, and disk usage
      const metrics = server.healthMetrics[0];
      if (!metrics) return acc;

      const healthScore = 100 - (
        (metrics.cpuUsage || 0) * 0.3 +
        (metrics.memoryUsage || 0) * 0.4 +
        (metrics.diskUsage || 0) * 0.3
      );
      return acc + healthScore;
    }, 0) / servers.length
    : 0;

  return (
    <AnimatedDashboardLayout>
      {/* Header Section */}
      <AnimatedSection className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Monitor and manage your VPS infrastructure
          </p>
        </div>
        <div className="flex space-x-3">
          <HealthCheckButtonContainer />
          <SpeedTestButtonContainer />
        </div>
      </AnimatedSection>

      {/* Metrics Cards */}
      <AnimatedSection>
        <AnimatedDashboardMetrics
          activeServers={activeServers.length}
          inactiveServers={inactiveServers.length}
          totalServers={servers.length}
          averageHealth={averageHealth}
        />
      </AnimatedSection>

      {/* Server Table */}
      <AnimatedSection className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Server Overview</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and monitor all your servers</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Live monitoring</span>
            </div>
          </div>
        </div>
        <div className="overflow-hidden">
          {isAdmin ? (
            <AnimatedServerTable servers={servers} isAdmin={true} />
          ) : (
            <AnimatedServerTable
              servers={servers}
              isAdmin={false}
              userPermissions={
                Object.fromEntries(
                  servers.map((server: any) => {
                    const access = server.userAccess && server.userAccess.length > 0 ? server.userAccess[0] : null;
                    return [
                      server.id,
                      {
                        canViewPassword: access?.canViewPassword || false,
                        canViewPrivateKey: access?.canViewPrivateKey || false,
                        canRunSpeedTest: access?.canRunSpeedTest !== undefined ? access.canRunSpeedTest : true,
                        canRunHealthCheck: access?.canRunHealthCheck !== undefined ? access.canRunHealthCheck : true
                      }
                    ];
                  })
                )
              }
            />
          )}
        </div>
      </AnimatedSection>
    </AnimatedDashboardLayout>
  );
}