"use client";

import { FiCpu, FiHardDrive, FiServer } from 'react-icons/fi';

interface HealthMetric {
  id: string;
  timestamp: string;
  cpuUsage?: number | null;
  memoryUsage?: number | null;
  diskUsage?: number | null;
  uptime?: number | null;
}

interface ServerHealthMetricsProps {
  healthMetrics: HealthMetric[];
}

const ServerHealthMetrics = ({ healthMetrics }: ServerHealthMetricsProps) => {
  // Get the most recent metric
  const latestMetric = healthMetrics.length > 0 ? healthMetrics[0] : null;

  if (!latestMetric) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Health Metrics</h2>
        <p className="text-gray-500 dark:text-gray-400">No health metrics available</p>
      </div>
    );
  }
  
  // Calculate overall health score (based on uptime field or calculate from metrics)
  const overallHealthScore = latestMetric.uptime !== null && latestMetric.uptime !== undefined 
    ? latestMetric.uptime 
    : 100 - ((latestMetric.cpuUsage || 0) * 0.3 + (latestMetric.memoryUsage || 0) * 0.4 + (latestMetric.diskUsage || 0) * 0.3);

  const getHealthColor = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'bg-gray-200 dark:bg-gray-700';
    if (value > 80) return 'bg-red-600';
    if (value > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getHealthScoreColor = (score: number) => {
    if (score < 50) return 'text-red-600 dark:text-red-400';
    if (score < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Health Metrics</h2>
      
      {/* Overall Health Score */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">Overall Health</h3>
          <span className={`text-xl font-bold ${getHealthScoreColor(overallHealthScore)}`}>
            {overallHealthScore.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${
              overallHealthScore >= 80 ? 'bg-green-500' :
              overallHealthScore >= 50 ? 'bg-yellow-500' :
              'bg-red-600'
            }`}
            style={{ width: `${Math.min(100, overallHealthScore)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Critical (0%)</span>
          <span>Good (100%)</span>
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="space-y-6">
        {/* CPU Usage */}
        <div>
          <div className="flex items-center mb-2">
            <FiCpu className="text-red-500 mr-2" />
            <h3 className="text-sm font-medium">CPU Usage</h3>
            <span className="ml-auto font-semibold">
              {latestMetric.cpuUsage !== null && latestMetric.cpuUsage !== undefined
                ? `${latestMetric.cpuUsage.toFixed(1)}%`
                : "N/A"
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={getHealthColor(latestMetric.cpuUsage)}
              style={{ 
                width: `${Math.min(100, latestMetric.cpuUsage || 0)}%`,
                height: '8px',
                borderRadius: '4px'
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex items-center mb-2">
            <FiServer className="text-yellow-500 mr-2" />
            <h3 className="text-sm font-medium">Memory Usage</h3>
            <span className="ml-auto font-semibold">
              {latestMetric.memoryUsage !== null && latestMetric.memoryUsage !== undefined
                ? `${latestMetric.memoryUsage.toFixed(1)}%`
                : "N/A"
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={getHealthColor(latestMetric.memoryUsage)}
              style={{ 
                width: `${Math.min(100, latestMetric.memoryUsage || 0)}%`,
                height: '8px',
                borderRadius: '4px'
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Disk Usage */}
        <div>
          <div className="flex items-center mb-2">
            <FiHardDrive className="text-indigo-500 mr-2" />
            <h3 className="text-sm font-medium">Disk Usage</h3>
            <span className="ml-auto font-semibold">
              {latestMetric.diskUsage !== null && latestMetric.diskUsage !== undefined
                ? `${latestMetric.diskUsage.toFixed(1)}%`
                : "N/A"
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={getHealthColor(latestMetric.diskUsage)}
              style={{ 
                width: `${Math.min(100, latestMetric.diskUsage || 0)}%`,
                height: '8px',
                borderRadius: '4px'
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-4">
          Last updated: {new Date(latestMetric.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ServerHealthMetrics;