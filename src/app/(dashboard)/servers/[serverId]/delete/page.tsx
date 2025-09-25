"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiLoader, FiAlertTriangle } from "react-icons/fi";

export default function DeleteServerPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const serverId = params.serverId as string;

  const onDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/servers/${serverId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete server");
      }

      router.refresh();
      router.push("/servers");
      toast.success("Server deleted successfully");
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Delete Server</h1>
        <p className="text-muted-foreground">
          Permanently delete this server from your monitoring dashboard
        </p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700">
          <FiAlertTriangle className="w-6 h-6 mr-4" />
          <div>
            <h3 className="font-medium">Warning: This action is irreversible</h3>
            <p className="text-sm">
              Once you delete this server, all its data, including monitoring history and speed tests, will be permanently removed.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
          >
            {isLoading && <FiLoader className="mr-2 animate-spin" />}
            Delete Server
          </button>
        </div>
      </div>
    </div>
  );
}