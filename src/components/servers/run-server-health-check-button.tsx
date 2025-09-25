"use client";

import { useState } from 'react';
import { FiActivity } from "react-icons/fi";
import toast from "react-hot-toast";

interface RunServerHealthCheckButtonProps {
  serverId: string;
  className?: string;
}

export default function RunServerHealthCheckButton({ serverId, className = "" }: RunServerHealthCheckButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const runHealthCheck = async () => {
    try {
      setIsLoading(true);
      toast.loading("Running health check on server...", { id: "server-healthcheck" });
      
      const response = await fetch(`/api/servers/${serverId}/health`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to run health check");
      }

      const result = await response.json();
      toast.success("Health check completed successfully!", { id: "server-healthcheck" });
      
      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Failed to run health check:", error);
      toast.error("Failed to run health check", { id: "server-healthcheck" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${className}`}
      onClick={runHealthCheck}
      disabled={isLoading}
    >
      <FiActivity className="mr-2" />
      {isLoading ? "Running Check..." : "Run Health Check"}
    </button>
  );
}