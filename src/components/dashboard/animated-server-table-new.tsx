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

interface ServerTableProps {
  servers: any[];
}

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  INACTIVE: "bg-red-100 text-red-800 border-red-200",
  MAINTENANCE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  UNKNOWN: "bg-gray-100 text-gray-800 border-gray-200",
};

const healthIcons = {
  ACTIVE: <FiCheck className="text-green-500" />,
  INACTIVE: <FiX className="text-red-500" />,
  MAINTENANCE: <FiAlertTriangle className="text-yellow-500" />,
  UNKNOWN: <FiHelpCircle className="text-gray-500" />,
};

const AnimatedServerTable = ({ servers }: ServerTableProps) => {
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
          <tr className="bg-gray-50/50">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Server
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              IP Address
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Health
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Last Check
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Speed Test
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {servers.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiHelpCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No servers found</h3>
                  <p className="text-gray-500 mb-4">Get started by adding your first server</p>
                  <Link
                    href="/servers/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Add Server
                  </Link>
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
                className="hover:bg-gray-50/50 transition-colors duration-200 group"
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
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {server.name}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
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
                      <div className="w-16 bg-gray-200 rounded-full h-2">
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
                      <span className={`text-sm font-semibold ${server.healthMetrics[0].uptime >= 90 ? 'text-green-600' :
                          server.healthMetrics[0].uptime >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                        {server.healthMetrics[0].uptime.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {server.lastChecked
                    ? formatDistanceToNow(new Date(server.lastChecked), {
                      addSuffix: true,
                    })
                    : "Never"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {server.speedTests && server.speedTests[0] && server.speedTests[0].downloadSpeed
                    ? (
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-blue-600">
                          {server.speedTests[0].downloadSpeed.toFixed(1)}
                        </span>
                        <span className="text-gray-500">Mbps</span>
                      </div>
                    )
                    : "Not tested"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href={`/servers/${server.id}/speedtest`}
                        className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                      >
                        <RiSpeedMiniLine className="mr-1 h-3 w-3" />
                        Test
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href={`/servers/${server.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                      >
                        <FiExternalLink className="mr-1 h-3 w-3" />
                        Details
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={() => openDeleteModal(server)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                      >
                        <FiTrash2 className="mr-1 h-3 w-3" />
                        Delete
                      </button>
                    </motion.div>
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <FiAlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Server</h3>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this server? This action cannot be undone.
                </p>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-6 rounded-md overflow-hidden shadow-sm border border-gray-200 bg-white">
                      <ReactCountryFlag
                        countryCode={serverToDelete.country}
                        svg
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {serverToDelete.name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {serverToDelete.ip}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                >
                  {isLoading ? (
                    <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FiTrash2 className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Deleting..." : "Delete Server"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedServerTable;