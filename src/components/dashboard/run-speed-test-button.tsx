"use client";

import { useState } from 'react';
import { RiSpeedMiniLine } from "react-icons/ri";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface RunSpeedTestButtonProps {
  className?: string;
}

export default function RunSpeedTestButton({ className = "" }: RunSpeedTestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const runSpeedTest = async () => {
    try {
      setIsLoading(true);
      toast.loading("Running speed tests on all servers...", { id: "speedtest" });

      const response = await fetch("/api/servers/speedtest-all", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to run speed test");
      }

      const result = await response.json();
      toast.success(`Speed test completed for ${result.completed} servers!`, { id: "speedtest" });

      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Failed to run speed test:", error);
      toast.error("Failed to run speed test", { id: "speedtest" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center justify-center bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 ${className}`}
      onClick={runSpeedTest}
      disabled={isLoading}
    >
      <motion.div
        animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
      >
        <RiSpeedMiniLine className="mr-2 h-4 w-4" />
      </motion.div>
      {isLoading ? "Running Tests..." : "Run Speed Test"}
    </motion.button>
  );
}