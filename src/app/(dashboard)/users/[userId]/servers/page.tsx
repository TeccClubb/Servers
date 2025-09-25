import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import UserServerAccess from "@/components/users/user-server-access";

interface UserServersPageProps {
  params: {
    userId: string;
  };
}

export default async function UserServersPage({ params }: UserServersPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Only allow admins to access this page
  const currentUser = await prismadb.user.findUnique({
    where: {
      email: session.user?.email!
    }
  });
  
  if (!currentUser || !('role' in currentUser) || currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch the user
  const { userId } = params;

  const user = await prismadb.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    redirect("/users");
  }

  // Fetch all servers
  const servers = await prismadb.server.findMany({
    orderBy: {
      name: "asc"
    }
  });

  // Fetch the user's server access
  let userServerAccess = [];
  try {
    // Check if ServerAccess model exists
    if ('serverAccess' in prismadb) {
      // @ts-ignore
      const access = await prismadb.serverAccess.findMany({
        where: {
          userId: userId
        }
      });
      userServerAccess = access;
    } else {
      // Fallback to raw SQL
      const results = await prismadb.$queryRaw`
        SELECT * FROM "ServerAccess"
        WHERE "userId" = ${userId}
      `;
      
      if (Array.isArray(results)) {
        userServerAccess = results;
      }
    }
  } catch (error) {
    console.error("Error fetching server access:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Manage Server Access</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure which servers {user.name || user.email} can access
        </p>
      </div>

      <UserServerAccess 
        user={user} 
        servers={servers} 
        existingAccess={userServerAccess} 
      />
    </div>
  );
}