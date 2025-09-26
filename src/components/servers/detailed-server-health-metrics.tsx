"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiHardDrive, FiServer, FiActivity, FiPieChart, FiSliders } from 'react-icons/fi';

interface DetailedHealthMetricsProps {
  healthData?: {
    cpu_usage_percentage: number;
    ram_usage_percentage: number;
    disk_usage_percentage: number;
    health_score: number;
    detailed_scores: {
      cpu: number;
      ram: number;
      disk: number;
      live_bw: number;
      monthly_bw: number;
    };
    weights: {
      cpu: number;
      ram: number;
      disk: number;
      live_bw: number;
      monthly_bw: number;
    };
    limits: {
      max_cpu_usage: number;
      max_ram_usage: number;
      max_disk_usage: number;
      max_bandwidth_per_mbit: number;
      max_bandwidth_monthly: number;
    };
    status: string;
  };
}

const DetailedServerHealthMetrics = ({ healthData }: DetailedHealthMetricsProps) => {
  if (!healthData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Detailed Health Metrics</h2>
        <p className="text-gray-500 dark:text-gray-400">No health data available</p>
      </div>
    );
  }

  const getHealthColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage > 80) return 'bg-red-600';
    if (percentage > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getHealthScoreColor = (score: number) => {
    if (score < 50) return 'text-red-600 dark:text-red-400';
    if (score < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

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
        <FiActivity className="mr-2 text-purple-500 dark:text-purple-400" />
        Detailed Health Metrics
      </h2>

      {/* Overall Health Score */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
              <FiPieChart className="text-purple-600 dark:text-purple-400 w-5 h-5" />
            </div>
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">Overall Health Score</h3>
          </div>
          <span className={`text-2xl font-bold ${getHealthScoreColor(healthData.health_score)}`}>
            {healthData.health_score}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
          <div
            className={`h-3 rounded-full ${healthData.health_score >= 80 ? 'bg-green-500' :
                healthData.health_score >= 50 ? 'bg-yellow-500' :
                  'bg-red-600'
              }`}
            style={{ width: `${Math.min(100, healthData.health_score)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Critical (0)</span>
          <span className="font-medium">Status: {healthData.status.toUpperCase()}</span>
          <span>Excellent (100)</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* CPU Usage */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800">
          <div className="flex items-center mb-3">
            <FiCpu className="text-red-600 dark:text-red-400 mr-2" />
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">CPU Usage</h3>
            <div className="ml-auto flex items-center">
              <span className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded-full border border-red-100 dark:border-red-700 text-red-600 dark:text-red-400">
                Weight: {healthData.weights.cpu * 100}%
              </span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                {healthData.cpu_usage_percentage}%
              </span>
            </div>
          </div>
          <div className="w-full bg-white/60 dark:bg-gray-700/60 rounded-full h-2.5">
            <div
              className={getHealthColor(healthData.cpu_usage_percentage, healthData.limits.max_cpu_usage)}
              style={{
                width: `${Math.min(100, (healthData.cpu_usage_percentage / healthData.limits.max_cpu_usage) * 100)}%`,
                height: '10px',
                borderRadius: '5px'
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>0%</span>
            <span>Limit: {healthData.limits.max_cpu_usage.toFixed(0)}%</span>
          </div>
          <div className="mt-2 text-xs text-right text-gray-600 dark:text-gray-400">
            Score: {healthData.detailed_scores.cpu.toFixed(1)}
          </div>
        </div>

        {/* RAM Usage */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
          <div className="flex items-center mb-3">
            <FiServer className="text-yellow-600 dark:text-yellow-400 mr-2" />
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">RAM Usage</h3>
            <div className="ml-auto flex items-center">
              <span className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded-full border border-yellow-100 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400">
                Weight: {healthData.weights.ram * 100}%
              </span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                {healthData.ram_usage_percentage}%
              </span>
            </div>
          </div>
          <div className="w-full bg-white/60 dark:bg-gray-700/60 rounded-full h-2.5">
            <div
              className={getHealthColor(healthData.ram_usage_percentage, healthData.limits.max_ram_usage)}
              style={{
                width: `${Math.min(100, (healthData.ram_usage_percentage / healthData.limits.max_ram_usage) * 100)}%`,
                height: '10px',
                borderRadius: '5px'
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>0%</span>
            <span>Limit: {healthData.limits.max_ram_usage.toFixed(0)}%</span>
          </div>
          <div className="mt-2 text-xs text-right text-gray-600 dark:text-gray-400">
            Score: {healthData.detailed_scores.ram.toFixed(1)}
          </div>
        </div>

        {/* Disk Usage */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center mb-3">
            <FiHardDrive className="text-indigo-600 dark:text-indigo-400 mr-2" />
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">Disk Usage</h3>
            <div className="ml-auto flex items-center">
              <span className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded-full border border-indigo-100 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400">
                Weight: {healthData.weights.disk * 100}%
              </span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                {healthData.disk_usage_percentage}%
              </span>
            </div>
          </div>
          <div className="w-full bg-white/60 dark:bg-gray-700/60 rounded-full h-2.5">
            <div
              className={getHealthColor(healthData.disk_usage_percentage, healthData.limits.max_disk_usage)}
              style={{
                width: `${Math.min(100, (healthData.disk_usage_percentage / healthData.limits.max_disk_usage) * 100)}%`,
                height: '10px',
                borderRadius: '5px'
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>0%</span>
            <span>Limit: {healthData.limits.max_disk_usage.toFixed(0)}%</span>
          </div>
          <div className="mt-2 text-xs text-right text-gray-600 dark:text-gray-400">
            Score: {healthData.detailed_scores.disk.toFixed(1)}
          </div>
        </div>

        {/* Bandwidth Scores */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-lg p-4 border border-teal-100 dark:border-teal-800">
          <div className="flex items-center mb-3">
            <FiSliders className="text-teal-600 dark:text-teal-400 mr-2" />
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">Bandwidth Scores</h3>
          </div>

          {/* Live Bandwidth Score */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-900 dark:text-gray-100">Live Bandwidth</span>
              <div className="flex items-center">
                <span className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded-full border border-teal-100 dark:border-teal-700 text-teal-600 dark:text-teal-400 mr-2">
                  Weight: {healthData.weights.live_bw * 100}%
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {healthData.detailed_scores.live_bw.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="w-full bg-white/60 dark:bg-gray-700/60 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full"
                style={{ width: `${Math.min(100, healthData.detailed_scores.live_bw)}%` }}
              />
            </div>
          </div>

          {/* Monthly Bandwidth Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-900 dark:text-gray-100">Monthly Bandwidth</span>
              <div className="flex items-center">
                <span className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded-full border border-teal-100 dark:border-teal-700 text-teal-600 dark:text-teal-400 mr-2">
                  Weight: {healthData.weights.monthly_bw * 100}%
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {healthData.detailed_scores.monthly_bw.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="w-full bg-white/60 dark:bg-gray-700/60 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full"
                style={{ width: `${Math.min(100, healthData.detailed_scores.monthly_bw)}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="text-xs text-gray-500 mt-4 flex justify-between">
        <span>Current date: {new Date().toLocaleString()}</span>
        <span className="italic">Score calculation based on usage vs. limits</span>
      </motion.div>
    </motion.div>
  );
};

export default DetailedServerHealthMetrics;