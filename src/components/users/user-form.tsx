"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  name: string | null;
  email: string;
  role?: string;
}

interface UserFormProps {
  user?: User;
  action: "create" | "update";
}

const UserForm = ({ user, action }: UserFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = action === "create"
        ? "/api/users"
        : `/api/users/${user?.id}`;

      const method = action === "create" ? "POST" : "PATCH";

      const body: any = { name, email };

      // Only include password if it's set (for updates) or if creating a new user
      if (password) {
        body.password = password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Something went wrong");
      }

      toast.success(action === "create" ? "User created!" : "User updated!");
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
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            disabled={isLoading}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
            disabled={isLoading}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">
            {action === "create" ? "Password" : "New Password (leave blank to keep current)"}
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={action === "create" ? "Enter password" : "Enter new password"}
            required={action === "create"}
            disabled={isLoading}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/users")}
          disabled={isLoading}
          className="mr-2"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : action === "create" ? "Create User" : "Update User"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;