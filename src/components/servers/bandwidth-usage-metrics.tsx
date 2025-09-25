"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiUpload, FiWifi, FiActivity, FiCalendar } from 'react-icons/fi';
import { RiSpeedMiniLine } from 'react-icons/ri';

interface BandwidthUsageProps {
  monthlyBandwidth?: {
    downloaded: string;
    uploaded: string;
    total: string;
    total_mb: number;
    limit_mb: number;
  };
  liveBandwidth?: {
    download_rate: string;
    upload_rate: string;
    total_mbit_per_s: number;
    limit_mbit_per_s: number;
  };
}

const BandwidthUsageMetrics = ({ monthlyBandwidth, liveBandwidth }: BandwidthUsageProps) => {
  const hasMonthlyData = monthlyBandwidth && Object.keys(monthlyBandwidth).length > 0;
  const hasLiveData = liveBandwidth && Object.keys(liveBandwidth).length > 0;
  
  if (!hasMonthlyData && !hasLiveData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Bandwidth Usage</h2>
        <p className="text-gray-500 dark:text-gray-400">No bandwidth data available</p>
      </div>
    );
  }
  
  // Calculate monthly bandwidth usage percentage
  const monthlyUsagePercent = hasMonthlyData 
    ? (monthlyBandwidth.total_mb / monthlyBandwidth.limit_mb) * 100 
    : 0;
  
  // Calculate live bandwidth usage percentage
  const liveUsagePercent = hasLiveData 
    ? (liveBandwidth.total_mbit_per_s / liveBandwidth.limit_mbit_per_s) * 100
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 } as any
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
    >
      <h2 className="text-lg font-medium mb-6 flex items-center text-gray-900 dark:text-gray-100">
        <FiWifi className="mr-2 text-blue-500 dark:text-blue-400" />
        Bandwidth Usage
      </h2>

      {/* Monthly Bandwidth Usage */}
      {hasMonthlyData && (
        <motion.div variants={itemVariants} className="mb-8 space-y-6">
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
              <FiCalendar className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            </div>
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">Monthly Bandwidth</h3>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
            {/* Usage Bar */}
            <div className="mb-3">
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Total Usage</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {monthlyBandwidth.total} of {(monthlyBandwidth.limit_mb / 1000).toFixed(0)} GB
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    monthlyUsagePercent >= 90 ? 'bg-red-600' : 
                    monthlyUsagePercent >= 75 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, monthlyUsagePercent)}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0%</span>
                <span>{monthlyUsagePercent.toFixed(1)}% used</span>
                <span>100%</span>
              </div>
            </div>
            
            {/* Download/Upload Details */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-blue-100 dark:border-blue-700">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <FiDownload className="mr-1 text-green-600 dark:text-green-400" />
                  <span>Downloaded</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{monthlyBandwidth.downloaded}</div>
              </div>
              
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-blue-100 dark:border-blue-700">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <FiUpload className="mr-1 text-red-600 dark:text-red-400" />
                  <span>Uploaded</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{monthlyBandwidth.uploaded}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Bandwidth Usage */}
      {hasLiveData && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center mb-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
              <RiSpeedMiniLine className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
            </div>
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">Live Bandwidth</h3>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
            {/* Usage Bar */}
            <div className="mb-3">
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Current Usage</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {liveBandwidth.total_mbit_per_s.toFixed(2)} of {liveBandwidth.limit_mbit_per_s} Mbit/s
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, liveUsagePercent)}%` }}
                  transition={{ duration: 1 }}
                  className={`h-2.5 rounded-full ${
                    liveUsagePercent >= 90 ? 'bg-red-600' : 
                    liveUsagePercent >= 75 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0%</span>
                <span>{liveUsagePercent.toFixed(4)}% used</span>
                <span>100%</span>
              </div>
            </div>
            
            {/* Download/Upload Rates */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-indigo-100 dark:border-indigo-700">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <FiDownload className="mr-1 text-green-600 dark:text-green-400" />
                  <span>Download Rate</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{liveBandwidth.download_rate}</div>
              </div>
              
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-indigo-100 dark:border-indigo-700">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <FiUpload className="mr-1 text-red-600 dark:text-red-400" />
                  <span>Upload Rate</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{liveBandwidth.upload_rate}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BandwidthUsageMetrics;