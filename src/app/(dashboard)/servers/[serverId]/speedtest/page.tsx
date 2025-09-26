import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import SpeedTestPage from "@/components/servers/speed-test";

interface ServerSpeedTestPageProps {
  params: {
    serverId: string;
  };
}

export default async function ServerSpeedTestPage({ params }: ServerSpeedTestPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { serverId } = await params;

  // Check user permissions
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
    }
  });

  if (!server) {
    redirect("/servers");
  }

  // Check for user's access permissions for this server
  let canRunSpeedTest = isAdmin; // Admins can always run speed tests

  // If not admin, check for specific permissions
  if (!isAdmin) {
    try {
      if ('serverAccess' in prismadb) {
        // @ts-ignore - The model exists in the DB but might not be in TS types yet
        const serverAccess = await prismadb.serverAccess.findUnique({
          where: {
            userId_serverId: {
              userId: user.id,
              serverId: server.id
            }
          }
        });

        canRunSpeedTest = serverAccess ? !!serverAccess.canRunSpeedTest : false;
      } else {
        // Fallback to raw SQL
        const results = await prismadb.$queryRaw`
          SELECT "canRunSpeedTest" FROM "ServerAccess"
          WHERE "userId" = ${user.id} 
          AND "serverId" = ${serverId}
          LIMIT 1
        `;

        canRunSpeedTest = Array.isArray(results) && results.length > 0 && results[0].canRunSpeedTest;
      }
    } catch (error) {
      console.error("Error fetching server access permissions:", error);
    }
  }

  // Redirect if user doesn't have permission
  if (!canRunSpeedTest) {
    redirect(`/servers/${serverId}`);
  }

  return <SpeedTestPage serverId={server.id} serverName={server.name} />;
}