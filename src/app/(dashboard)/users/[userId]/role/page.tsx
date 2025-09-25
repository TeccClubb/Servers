import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import UserRoleForm from "@/components/users/user-role-form";

interface UserRolePageProps {
  params: {
    userId: string;
  };
}

export default async function UserRolePage({ params }: UserRolePageProps) {
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

  // Fetch the user to edit
  const { userId } = params;

  const user = await prismadb.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    redirect("/users");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Manage User Role</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update role for {user.name || user.email}
        </p>
      </div>

      <UserRoleForm user={user} />
    </div>
  );
}