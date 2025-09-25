import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import AnimatedServerDetailView from "@/components/servers/animated-server-detail";
import ServerHealthChart from "@/components/servers/server-health-chart";
import ServerActions from "@/components/servers/server-actions";
import ServerHealthMetrics from "@/components/servers/server-health-metrics";
import BandwidthUsageMetrics from "@/components/servers/bandwidth-usage-metrics";
import DetailedServerHealthMetrics from "@/components/servers/detailed-server-health-metrics";
import AnimatedDashboardLayout, { AnimatedSection } from "@/components/ui/animated-layout";

interface ServerDetailPageProps {
  params: {
    serverId: string;
  };
}

async function fetchHealthApiData(serverIp: string) {
  try {
    // Make a real API call to the server's health endpoint
    const response = await fetch(`http://${serverIp}:5001/api/vps-health`, { 
      cache: 'no-store',
      next: { revalidate: 0 }  // Ensure fresh data on every request
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching health data: ${response.status} ${response.statusText}`);
    }
    
    const healthApiData = await response.json();
    console.log("Fetched real health data:", healthApiData);
    return healthApiData;
  } catch (error) {
    console.error("Error fetching health API data:", error);
    
    // Fallback to dummy data in case the API call fails
    // This ensures the UI won't break if the server is down
    const fallbackData = {
      "cpu_usage_percentage": 0,
      "current_date_utc": new Date().toISOString(),
      "current_user": "N/A",
      "detailed_scores": {
        "cpu": 0,
        "disk": 0,
        "live_bw": 0,
        "monthly_bw": 0,
        "ram": 0
      },
      "disk_usage_percentage": 0,
      "health_score": 0,
      "limits": {
        "max_bandwidth_monthly": 0,
        "max_bandwidth_per_mbit": 0,
        "max_cpu_usage": 0,
        "max_disk_usage": 0,
        "max_ram_usage": 0
      },
      "live_bandwidth": {
        "download_rate": "0 bit/s",
        "limit_mbit_per_s": 0,
        "total_mbit_per_s": 0,
        "upload_rate": "0 bit/s"
      },
      "monthly_bandwidth": {
        "downloaded": "0 GiB",
        "limit_mb": 0,
        "total": "0 GiB",
        "total_mb": 0,
        "uploaded": "0 GiB"
      },
      "ram_usage_percentage": 0,
      "status": "unknown",
      "weights": {
        "cpu": 0,
        "disk": 0,
        "live_bw": 0,
        "monthly_bw": 0,
        "ram": 0
      }
    };
    
    return fallbackData;
  }
}

export default async function ServerDetailPage({ params }: ServerDetailPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { serverId } = await params;

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

  // Get the server data
  const server = await prismadb.server.findUnique({
    where: {
      id: serverId
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
  
  // Check for user's access permissions for this server
  let serverAccess = null;
  
  // If not admin, check for specific permissions
  if (!isAdmin) {
    try {
      if ('serverAccess' in prismadb) {
        // @ts-ignore - The model exists in the DB but might not be in TS types yet
        serverAccess = await prismadb.serverAccess.findUnique({
          where: {
            userId_serverId: {
              userId: user.id,
              serverId: server?.id || ''
            }
          }
        });
      } else {
        // Fallback to raw SQL
        const results = await prismadb.$queryRaw`
          SELECT * FROM "ServerAccess"
          WHERE "userId" = ${user.id} 
          AND "serverId" = ${serverId}
          LIMIT 1
        `;
        
        if (Array.isArray(results) && results.length > 0) {
          serverAccess = results[0];
        }
      }
    } catch (error) {
      console.error("Error fetching server access permissions:", error);
    }
  }

  if (!server) {
    redirect("/servers");
  }
  
  // Determine permissions
  const permissions = {
    canViewPassword: isAdmin || (serverAccess && serverAccess.canViewPassword),
    canViewPrivateKey: isAdmin || (serverAccess && serverAccess.canViewPrivateKey),
    canRunSpeedTest: isAdmin || (serverAccess && serverAccess.canRunSpeedTest),
    canRunHealthCheck: isAdmin || (serverAccess && serverAccess.canRunHealthCheck),
  };
  
  // Mask sensitive information if user doesn't have permission
  const serverWithPermissions = {
    ...server,
    password: permissions.canViewPassword ? server.password : server.password ? '••••••••' : null,
    privateKey: permissions.canViewPrivateKey ? server.privateKey : server.privateKey ? '••••••••' : null,
  };
  
  // Fetch health API data for this server
  console.log(`Fetching health data from http://${server.ip}:5001/api/vps-health`);
  const healthApiData = await fetchHealthApiData(server.ip);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Server Details</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage server information
          </p>
        </div>
        <ServerActions 
          serverId={server.id} 
          permissions={{
            ...permissions,
            isAdmin
          }}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <AnimatedServerDetailView 
            server={serverWithPermissions} 
            permissions={permissions}
          />
          
          {/* Display user permissions */}
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Your Permissions</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${permissions.canViewPassword ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>View Password</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${permissions.canViewPrivateKey ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>View Private Key</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${permissions.canRunSpeedTest ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Run Speed Tests</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${permissions.canRunHealthCheck ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Run Health Checks</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <ServerHealthMetrics healthMetrics={server.healthMetrics as any} />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Health History</h2>
            <ServerHealthChart healthMetrics={server.healthMetrics as any} />
          </div>
        </div>
      </div>
      
      {/* Detailed Health and Bandwidth Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detailed Server Health Metrics */}
        {healthApiData && (
          <DetailedServerHealthMetrics healthData={healthApiData} />
        )}
        
        {/* Bandwidth Usage Metrics */}
        {healthApiData && healthApiData.monthly_bandwidth && healthApiData.live_bandwidth && (
          <BandwidthUsageMetrics 
            monthlyBandwidth={healthApiData.monthly_bandwidth}
            liveBandwidth={healthApiData.live_bandwidth}
          />
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Speed Test History</h2>
        {server.speedTests.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No speed tests have been performed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Download</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Upload</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ping</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {server.speedTests.map((test: any) => (
                  <tr key={test.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(test.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {test.downloadSpeed?.toFixed(2)} Mbps
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {test.uploadSpeed?.toFixed(2)} Mbps
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {test.ping?.toFixed(1)} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}