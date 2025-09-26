"use client";

import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FiServer,
  FiGlobe,
  FiUser,
  FiKey,
  FiCalendar,
  FiClock,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiLock,
  FiPackage,
  FiCloud,
  FiLink
} from "react-icons/fi";

interface AnimatedServerDetailViewProps {
  server: any;
  permissions?: {
    canViewPassword?: boolean;
    canViewPrivateKey?: boolean;
    canRunSpeedTest?: boolean;
    canRunHealthCheck?: boolean;
    isAdmin?: boolean;
  };
}

const AnimatedServerDetailView = ({ server, permissions = {} }: AnimatedServerDetailViewProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

  // Check if user has permission to view password and private key
  const canViewPassword = permissions?.canViewPassword || false;
  const canViewPrivateKey = permissions?.canViewPrivateKey || false;

  const statusColors = {
    ACTIVE: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-700",
    INACTIVE: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-700",
    MAINTENANCE: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700",
    UNKNOWN: "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-600",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyStatus({ ...copyStatus, [field]: true });
        toast.success(`${field} copied to clipboard`);
        setTimeout(() => {
          setCopyStatus({ ...copyStatus, [field]: false });
        }, 2000);
      })
      .catch(() => {
        toast.error("Failed to copy text");
      });
  };

  // No longer need password authentication

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex items-center mb-8">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
          className="mr-6"
        >
          <div className="w-12 h-9 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
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
        <div className="flex-1">
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
          >
            {server.name}
          </motion.h2>
          <motion.div variants={itemVariants} className="flex items-center space-x-3">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 text-sm font-semibold rounded-full border ${statusColors[server.status as keyof typeof statusColors]
                }`}
            >
              {server.status}
            </motion.span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">•</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">Server ID: {server.id.slice(0, 8)}...</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Information Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Server Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FiServer className="mr-2 text-blue-600 dark:text-blue-400" />
            Server Information
          </h3>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FiGlobe className="text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">IP Address</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => copyToClipboard(server.ip, "IP Address")}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors"
              >
                {copyStatus["IP Address"] ? (
                  <FiCheck className="text-green-600 dark:text-green-400 w-4 h-4" />
                ) : (
                  <FiCopy className="text-blue-600 dark:text-blue-400 w-4 h-4" />
                )}
              </motion.button>
            </div>
            <span className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-3 py-1 rounded border border-gray-200 dark:border-gray-600">
              {server.ip}
            </span>
          </motion.div>

          {server.domain && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FiLink className="text-indigo-600 dark:text-indigo-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Domain</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(server.domain, "Domain")}
                  className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full transition-colors"
                >
                  {copyStatus["Domain"] ? (
                    <FiCheck className="text-green-600 dark:text-green-400 w-4 h-4" />
                  ) : (
                    <FiCopy className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
                  )}
                </motion.button>
              </div>
              <span className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-3 py-1 rounded border border-gray-200 dark:border-gray-600">
                {server.domain}
              </span>
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800"
          >
            <div className="flex items-center mb-2">
              <div className="w-6 h-4 rounded-sm overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 mr-2">
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
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{server.country}</span>
          </motion.div>
        </div>

        {/* Access Information */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <FiKey className="mr-2 text-green-600 dark:text-green-400" />
              Access Information
            </h3>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FiUser className="text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Username</span>
              </div>
              {server.username && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(server.username || "", "Username")}
                  className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded-full transition-colors"
                >
                  {copyStatus["Username"] ? (
                    <FiCheck className="text-green-600 dark:text-green-400 w-4 h-4" />
                  ) : (
                    <FiCopy className="text-green-600 dark:text-green-400 w-4 h-4" />
                  )}
                </motion.button>
              )}
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {server.username || "Not provided"}
            </span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FiKey className="text-orange-600 dark:text-orange-400 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Password</span>
              </div>
              <div className="flex items-center space-x-1">
                {canViewPassword && server.password && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(server.password || "", "Password")}
                    className="p-1 hover:bg-orange-100 dark:hover:bg-orange-800 rounded-full transition-colors"
                  >
                    {copyStatus["Password"] ? (
                      <FiCheck className="text-green-600 dark:text-green-400 w-4 h-4" />
                    ) : (
                      <FiCopy className="text-orange-600 dark:text-orange-400 w-4 h-4" />
                    )}
                  </motion.button>
                )}
                {canViewPassword && server.password && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-orange-100 dark:hover:bg-orange-800 rounded-full transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff className="text-orange-600 dark:text-orange-400 w-4 h-4" />
                    ) : (
                      <FiEye className="text-orange-600 dark:text-orange-400 w-4 h-4" />
                    )}
                  </motion.button>
                )}
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {!server.password
                ? "Not provided"
                : canViewPassword
                  ? showPassword
                    ? server.password
                    : "••••••••"
                  : "No permission to view password"
              }
            </span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-lg p-4 border border-cyan-100 dark:border-cyan-800"
          >
            <div className="flex items-center mb-2">
              <FiCloud className="text-cyan-600 dark:text-cyan-400 mr-2" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Provider</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              TecClub
            </span>
          </motion.div>
        </div>

        {/* Timestamps */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FiClock className="mr-2 text-gray-600 dark:text-gray-400" />
            Timeline
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-2">
                <FiCalendar className="text-gray-600 dark:text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At</span>
              </div>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {new Date(server.createdAt).toLocaleString()}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-2">
                <FiClock className="text-gray-600 dark:text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Checked</span>
              </div>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {server.lastChecked
                  ? new Date(server.lastChecked).toLocaleString()
                  : "Never"}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Private Key Section */}
        {server.privateKey && (
          <motion.div
            variants={itemVariants}
            className="md:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <FiKey className="mr-2 text-purple-600 dark:text-purple-400" />
                Private Key
              </h3>

              {canViewPrivateKey && (
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="flex items-center space-x-1 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 px-3 py-1 rounded-md text-sm text-purple-700 dark:text-purple-400 transition-colors"
                  >
                    {showPrivateKey ? (
                      <>
                        <FiEyeOff className="w-4 h-4" /> <span>Hide Key</span>
                      </>
                    ) : (
                      <>
                        <FiEye className="w-4 h-4" /> <span>Show Key</span>
                      </>
                    )}
                  </motion.button>

                  {showPrivateKey && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(server.privateKey || "", "Private Key")}
                      className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-3 py-1 rounded-md text-sm text-blue-700 dark:text-blue-400 transition-colors"
                    >
                      {copyStatus["Private Key"] ? (
                        <>
                          <FiCheck className="w-4 h-4" /> <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-4 h-4" /> <span>Copy Key</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {!canViewPrivateKey ? (
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg p-6 border border-amber-200 dark:border-amber-800 text-center"
              >
                <FiLock className="mx-auto h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No Permission</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">You don't have permission to view the private key</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {showPrivateKey ? (
                  <motion.div
                    key="privatekey-shown"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="max-h-64 overflow-y-auto">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                        {server.privateKey}
                      </pre>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="privatekey-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center"
                  >
                    <p className="text-gray-600 dark:text-gray-400">
                      <FiEyeOff className="inline-block mr-2" />
                      Private key is hidden. Click "Show Key" to view the content.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AnimatedServerDetailView;