import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import UsersList from "@/components/users/users-list";

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Only allow admins to access this page
  const user = await prismadb.user.findUnique({
    where: {
      email: session.user?.email!
    }
  });
  
  if (!user || (user.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  // Fetch all users
  const users = await prismadb.user.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Users</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user accounts and permissions
          </p>
        </div>
        <Link
          href="/users/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <FiPlus className="mr-2" />
          Add User
        </Link>
      </div>

      <UsersList users={users} />
    </div>
  );
}