"use client";

import ReactCountryFlag from "react-country-flag";

interface ServerDetailViewProps {
  server: any;
}

const ServerDetailView = ({ server }: ServerDetailViewProps) => {
  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-red-100 text-red-800",
    MAINTENANCE: "bg-yellow-100 text-yellow-800",
    UNKNOWN: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div className="mr-4">
          <ReactCountryFlag
            countryCode={server.country}
            svg
            style={{
              width: '2em',
              height: '2em',
            }}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold">{server.name}</h2>
          <div className="flex items-center mt-1">
            <span
              className={`px-2 py-1 text-xs inline-flex font-semibold rounded-full ${statusColors[server.status as keyof typeof statusColors]
                }`}
            >
              {server.status}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">IP Address</dt>
            <dd className="mt-1 text-sm text-gray-900">{server.ip}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-sm text-gray-900 flex items-center">
              <ReactCountryFlag
                countryCode={server.country}
                svg
                style={{
                  width: '1em',
                  height: '1em',
                  marginRight: '0.5em'
                }}
              />
              {server.country}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Username</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {server.username || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Password</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {server.password ? "••••••••" : "Not provided"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Private Key</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {server.privateKey ? (
                <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                  <pre className="text-xs">{server.privateKey}</pre>
                </div>
              ) : (
                "Not provided"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(server.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Checked</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {server.lastChecked
                ? new Date(server.lastChecked).toLocaleString()
                : "Never"}
            </dd>
          </div>

          {/* Speed Test Information */}
          {server.speedTests && server.speedTests[0] && (
            <>
              <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Latest Speed Test Results</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Download Speed</dt>
                    <dd className="mt-1 text-lg font-semibold text-blue-700">
                      {server.speedTests[0].downloadSpeed ? `${server.speedTests[0].downloadSpeed.toFixed(2)} Mbps` : "N/A"}
                    </dd>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Upload Speed</dt>
                    <dd className="mt-1 text-lg font-semibold text-green-700">
                      {server.speedTests[0].uploadSpeed ? `${server.speedTests[0].uploadSpeed.toFixed(2)} Mbps` : "N/A"}
                    </dd>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Ping</dt>
                    <dd className="mt-1 text-lg font-semibold text-purple-700">
                      {server.speedTests[0].ping ? `${server.speedTests[0].ping.toFixed(2)} ms` : "N/A"}
                    </dd>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Health Metrics Information */}
          {server.healthMetrics && server.healthMetrics[0] && (
            <>
              <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Latest Health Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* CPU Usage Meter */}
                  <div className="bg-red-50 p-3 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">CPU Usage</dt>
                    <dd className="mt-1 text-lg font-semibold text-red-700">
                      {server.healthMetrics[0].cpuUsage !== null ? `${server.healthMetrics[0].cpuUsage}%` : "N/A"}
                    </dd>
                    {server.healthMetrics[0].cpuUsage !== null && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${server.healthMetrics[0].cpuUsage > 80 ? 'bg-red-600' :
                                server.healthMetrics[0].cpuUsage > 50 ? 'bg-yellow-500' :
                                  'bg-green-500'
                              }`}
                            style={{ width: `${Math.min(100, server.healthMetrics[0].cpuUsage)}%` }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Memory Usage Meter */}
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Memory Usage</dt>
                    <dd className="mt-1 text-lg font-semibold text-yellow-700">
                      {server.healthMetrics[0].memoryUsage !== null ? `${server.healthMetrics[0].memoryUsage}%` : "N/A"}
                    </dd>
                    {server.healthMetrics[0].memoryUsage !== null && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${server.healthMetrics[0].memoryUsage > 80 ? 'bg-red-600' :
                                server.healthMetrics[0].memoryUsage > 50 ? 'bg-yellow-500' :
                                  'bg-green-500'
                              }`}
                            style={{ width: `${Math.min(100, server.healthMetrics[0].memoryUsage)}%` }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Disk Usage Meter */}
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Disk Usage</dt>
                    <dd className="mt-1 text-lg font-semibold text-indigo-700">
                      {server.healthMetrics[0].diskUsage !== null ? `${server.healthMetrics[0].diskUsage}%` : "N/A"}
                    </dd>
                    {server.healthMetrics[0].diskUsage !== null && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${server.healthMetrics[0].diskUsage > 80 ? 'bg-red-600' :
                                server.healthMetrics[0].diskUsage > 50 ? 'bg-yellow-500' :
                                  'bg-green-500'
                              }`}
                            style={{ width: `${Math.min(100, server.healthMetrics[0].diskUsage)}%` }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </dl>
      </div>
    </div>
  );
};

export default ServerDetailView;