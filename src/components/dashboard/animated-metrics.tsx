"use client";

import { motion } from "framer-motion";
import { FiServer, FiActivity, FiTrendingUp, FiZap } from "react-icons/fi";

interface AnimatedMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  delay?: number;
}

const AnimatedMetricCard = ({
  title,
  value,
  icon,
  color,
  change,
  changeType = 'neutral',
  delay = 0
}: AnimatedMetricCardProps) => {
  const changeColor = changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
    changeType === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
            className="flex items-baseline"
          >
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {change && (
              <span className={`ml-2 text-sm font-medium ${changeColor}`}>
                {change}
              </span>
            )}
          </motion.div>
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.1 }}
          className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
};

interface DashboardMetricsProps {
  activeServers: number;
  inactiveServers: number;
  totalServers: number;
  averageHealth: number;
}

const DashboardMetrics = ({
  activeServers,
  inactiveServers,
  totalServers,
  averageHealth,
}: DashboardMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <AnimatedMetricCard
        title="Total Servers"
        value={totalServers}
        icon={<FiServer className="h-6 w-6 text-white" />}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
        change="+2 this week"
        changeType="positive"
        delay={0}
      />

      <AnimatedMetricCard
        title="Active Servers"
        value={activeServers}
        icon={<FiActivity className="h-6 w-6 text-white" />}
        color="bg-gradient-to-br from-green-500 to-green-600"
        change={`${Math.round((activeServers / totalServers) * 100)}% uptime`}
        changeType="positive"
        delay={0.1}
      />

      <AnimatedMetricCard
        title="Inactive Servers"
        value={inactiveServers}
        icon={<FiZap className="h-6 w-6 text-white" />}
        color="bg-gradient-to-br from-red-500 to-red-600"
        change={inactiveServers === 0 ? "All systems operational" : "Needs attention"}
        changeType={inactiveServers === 0 ? "positive" : "negative"}
        delay={0.2}
      />

      <AnimatedMetricCard
        title="Average Health"
        value={`${averageHealth.toFixed(1)}%`}
        icon={<FiTrendingUp className="h-6 w-6 text-white" />}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
        change={averageHealth > 80 ? "Excellent" : averageHealth > 60 ? "Good" : "Needs improvement"}
        changeType={averageHealth > 80 ? "positive" : averageHealth > 60 ? "neutral" : "negative"}
        delay={0.3}
      />
    </div>
  );
};

export default DashboardMetrics;