"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiExternalLink, FiTrash2, FiLoader, FiAlertCircle } from "react-icons/fi";
import { RiSpeedMiniLine } from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import ReactCountryFlag from "react-country-flag";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FiCheck,
  FiAlertTriangle,
  FiX,
  FiHelpCircle,
} from "react-icons/fi";
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";

interface ServerTableProps {
  servers: any[];
  isAdmin?: boolean;
  userPermissions?: Record<string, {
    canViewPassword?: boolean;
    canViewPrivateKey?: boolean;
    canRunSpeedTest?: boolean;
    canRunHealthCheck?: boolean;
  }>;
}

const statusColors = {
  ACTIVE: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-700",
  INACTIVE: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-700",
  MAINTENANCE: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700",
  UNKNOWN: "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-600",
};

const healthIcons = {
  ACTIVE: <FiCheck className="text-green-500" />,
  INACTIVE: <FiX className="text-red-500" />,
  MAINTENANCE: <FiAlertTriangle className="text-yellow-500" />,
  UNKNOWN: <FiHelpCircle className="text-gray-500" />,
};

const AnimatedServerTable = ({ servers, isAdmin = false, userPermissions = {} }: ServerTableProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteServerId, setDeleteServerId] = useState<string | null>(null);
  const [serverToDelete, setServerToDelete] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openDeleteModal = (server: any) => {
    setServerToDelete(server);
    setDeleteServerId(server.id);
    setIsDeleting(true);
  };

  const closeDeleteModal = () => {
    setIsDeleting(false);
    setServerToDelete(null);
    setDeleteServerId(null);
  };

  const handleDelete = async () => {
    if (!deleteServerId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/servers/${deleteServerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete server");
      }

      toast.success("Server deleted successfully");
      closeDeleteModal();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50/50 dark:bg-gray-800/50">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Server
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              IP Address
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Health
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Last Check
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Speed Test
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {servers.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <FiHelpCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No servers found</h3>
                  {isAdmin ? (
                    <>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by adding your first server</p>
                      <Link
                        href="/servers/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Add Server
                      </Link>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have access to any servers yet. Contact an admin for access.</p>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            servers.map((server, index) => (
              <motion.tr
                key={server.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <div className="w-8 h-6 rounded-md overflow-hidden shadow-sm border border-gray-200 bg-white">
                        <ReactCountryFlag
                          countryCode={server.country}
                          svg
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    </motion.div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {server.name}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                    {server.ip}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[server.status as keyof typeof statusColors] || statusColors.UNKNOWN
                      }`}
                  >
                    {server.status}
                  </motion.span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {healthIcons[server.status as keyof typeof healthIcons] || healthIcons.UNKNOWN}
                    </motion.div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {server.healthMetrics && server.healthMetrics[0] && server.healthMetrics[0].uptime !== undefined ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, server.healthMetrics[0].uptime)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-2 rounded-full ${server.healthMetrics[0].uptime >= 90 ? 'bg-green-500' :
                              server.healthMetrics[0].uptime >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`}
                        />
                      </div>
                      <span className={`text-sm font-semibold ${server.healthMetrics[0].uptime >= 90 ? 'text-green-600 dark:text-green-400' :
                          server.healthMetrics[0].uptime >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                        }`}>
                        {server.healthMetrics[0].uptime.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">N/A</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {server.lastChecked
                    ? formatDistanceToNow(new Date(server.lastChecked), {
                      addSuffix: true,
                    })
                    : "Never"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {server.speedTests && server.speedTests[0] && server.speedTests[0].downloadSpeed
                    ? (
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {server.speedTests[0].downloadSpeed.toFixed(1)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">Mbps</span>
                      </div>
                    )
                    : "Not tested"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Show Speed Test button only if admin or user has permission */}
                    {(isAdmin || (userPermissions[server.id]?.canRunSpeedTest)) && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href={`/servers/${server.id}/speedtest`}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors duration-200"
                        >
                          <RiSpeedMiniLine className="mr-1 h-3 w-3" />
                          Test
                        </Link>
                      </motion.div>
                    )}

                    {/* Details button is visible to all users with access */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href={`/servers/${server.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                      >
                        <FiExternalLink className="mr-1 h-3 w-3" />
                        Details
                      </Link>
                    </motion.div>

                    {/* Delete button only shown to admins */}
                    {isAdmin && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <button
                          onClick={() => openDeleteModal(server)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                        >
                          <FiTrash2 className="mr-1 h-3 w-3" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleting && serverToDelete && (
          <DeleteConfirmationModal
            isOpen={isDeleting}
            server={serverToDelete}
            onClose={closeDeleteModal}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedServerTable;