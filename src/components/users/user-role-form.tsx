"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  name: string | null;
  email: string;
  role?: string;
}

interface UserRoleFormProps {
  user: User;
}

const UserRoleForm = ({ user }: UserRoleFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState(user.role || "USER");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Something went wrong");
      }

      toast.success("User role updated!");
      router.refresh();
      router.push("/users");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          User Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={isLoading}
        >
          <option value="USER">User</option>
          <option value="ADMIN">Administrator</option>
        </select>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {role === "ADMIN"
            ? "Administrators have full access to all features and can manage users and servers."
            : "Regular users can only access servers they've been granted permission to view."}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push("/users")}
          disabled={isLoading}
          className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? "Saving..." : "Save Role"}
        </button>
      </div>
    </form>
  );
};

export default UserRoleForm;