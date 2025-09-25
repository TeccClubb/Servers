import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import UserForm from "@/components/users/user-form";

export default async function NewUserPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Add New User</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new user account
        </p>
      </div>

      <UserForm action="create" />
    </div>
  );
}