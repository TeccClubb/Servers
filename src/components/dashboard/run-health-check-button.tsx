"use client";

import { useState } from 'react';
import { FiActivity } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface RunHealthCheckButtonProps {
  className?: string;
}

export default function RunHealthCheckButton({ className = "" }: RunHealthCheckButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const runHealthCheck = async () => {
    try {
      setIsLoading(true);
      toast.loading("Running health checks on all servers...", { id: "healthcheck" });
      
      const response = await fetch("/api/servers/health-all", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to run health check");
      }

      const result = await response.json();
      toast.success(`Health check completed for ${result.completed} servers!`, { id: "healthcheck" });
      
      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Failed to run health check:", error);
      toast.error("Failed to run health check", { id: "healthcheck" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ${className}`}
      onClick={runHealthCheck}
      disabled={isLoading}
    >
      <motion.div
        animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
      >
        <FiActivity className="mr-2 h-4 w-4" />
      </motion.div>
      {isLoading ? "Running Checks..." : "Run Health Check"}
    </motion.button>
  );
}