import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import { RiSpeedMiniLine } from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import ReactCountryFlag from "react-country-flag";
import {
  FiCheck,
  FiAlertTriangle,
  FiX,
  FiHelpCircle
} from "react-icons/fi";

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
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-red-100 text-red-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  UNKNOWN: "bg-gray-100 text-gray-800",
};

const healthIcons = {
  ACTIVE: <FiCheck className="text-green-500" />,
  INACTIVE: <FiX className="text-red-500" />,
  MAINTENANCE: <FiAlertTriangle className="text-yellow-500" />,
  UNKNOWN: <FiHelpCircle className="text-gray-500" />,
};

const ServerTable = ({ servers, isAdmin = false, userPermissions = {} }: ServerTableProps) => {
  return (
    <div className="overflow-x-auto shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
            >
              Server
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8"
            >
              IP Address
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12"
            >
              Health
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10"
            >
              Score
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8"
            >
              Last Check
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8"
            >
              Last Speed Test
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {servers.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                No servers found. Add your first server to get started!
              </td>
            </tr>
          ) : (
            servers.map((server) => (
              <tr key={server.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <ReactCountryFlag
                        countryCode={server.country}
                        svg
                        style={{
                          width: '1.5em',
                          height: '1.5em',
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{server.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {server.ip}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[server.status as keyof typeof statusColors] || statusColors.UNKNOWN
                      }`}
                  >
                    {server.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    {healthIcons[server.status as keyof typeof healthIcons] || healthIcons.UNKNOWN}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {server.healthMetrics && server.healthMetrics[0] && server.healthMetrics[0].uptime !== undefined ? (
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className={`h-2.5 rounded-full ${server.healthMetrics[0].uptime >= 90 ? 'bg-green-500' :
                              server.healthMetrics[0].uptime >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`}
                          style={{ width: `${Math.min(100, server.healthMetrics[0].uptime)}%` }}
                        />
                      </div>
                      <span className={
                        server.healthMetrics[0].uptime >= 90 ? 'text-green-600' :
                          server.healthMetrics[0].uptime >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                      }>
                        {server.healthMetrics[0].uptime.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {server.lastChecked
                    ? formatDistanceToNow(new Date(server.lastChecked), {
                      addSuffix: true,
                    })
                    : "Never"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {server.speedTests && server.speedTests[0] && server.speedTests[0].downloadSpeed
                    ? `${server.speedTests[0].downloadSpeed.toFixed(2)} Mbps`
                    : "Not tested"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {(isAdmin || (userPermissions[server.id]?.canRunSpeedTest)) && (
                    <Link
                      href={`/servers/${server.id}/speedtest`}
                      className="text-indigo-600 hover:text-indigo-900 inline-flex items-center mr-2"
                    >
                      <RiSpeedMiniLine className="mr-1" />
                      Speed Test
                    </Link>
                  )}
                  <Link
                    href={`/servers/${server.id}`}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                  >
                    <FiExternalLink className="mr-1" />
                    Details
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ServerTable;