import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import UserForm from "@/components/users/user-form";

interface UserEditPageProps {
  params: {
    userId: string;
  };
}

export default async function UserEditPage({ params }: UserEditPageProps) {
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

  if (!currentUser || (currentUser.role !== "ADMIN")) {
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Edit User</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update user information
        </p>
      </div>

      <UserForm
        user={user}
        action="update"
      />
    </div>
  );
}