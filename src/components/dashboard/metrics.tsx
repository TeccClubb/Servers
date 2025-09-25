import { FiServer, FiActivity } from "react-icons/fi";
import { BiSolidServer } from "react-icons/bi";
import { IoMdCheckmarkCircleOutline, IoMdCloseCircleOutline } from "react-icons/io";

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
  averageHealth
}: DashboardMetricsProps) => {
  const healthColor = averageHealth > 80 
    ? "text-green-500" 
    : averageHealth > 60 
    ? "text-yellow-500" 
    : "text-red-500";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-blue-100 mr-4">
            <FiServer className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Servers</p>
            <h3 className="text-2xl font-bold">{totalServers}</h3>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-green-100 mr-4">
            <IoMdCheckmarkCircleOutline className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Servers</p>
            <h3 className="text-2xl font-bold">{activeServers}</h3>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-red-100 mr-4">
            <IoMdCloseCircleOutline className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Inactive Servers</p>
            <h3 className="text-2xl font-bold">{inactiveServers}</h3>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-purple-100 mr-4">
            <FiActivity className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Average Health</p>
            <h3 className={`text-2xl font-bold ${healthColor}`}>
              {averageHealth.toFixed(1)}%
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;