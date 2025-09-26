"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiCheck, FiX } from "react-icons/fi";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Server {
  id: string;
  name: string;
  ip: string;
  domain?: string | null;
}

interface ServerAccess {
  id: string;
  userId: string;
  serverId: string;
  canViewPassword: boolean;
  canViewPrivateKey: boolean;
  canRunSpeedTest: boolean;
  canRunHealthCheck: boolean;
}

interface UserServerAccessProps {
  user: User;
  servers: Server[];
  existingAccess: ServerAccess[];
}

const UserServerAccess = ({ user, servers, existingAccess }: UserServerAccessProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverAccess, setServerAccess] = useState<Record<string, {
    hasAccess: boolean;
    canViewPassword: boolean;
    canViewPrivateKey: boolean;
    canRunSpeedTest: boolean;
    canRunHealthCheck: boolean;
    accessId?: string;
  }>>({});

  // Initialize server access from existing access
  useEffect(() => {
    const initialAccess: Record<string, any> = {};

    // First, set all servers to no access
    servers.forEach(server => {
      initialAccess[server.id] = {
        hasAccess: false,
        canViewPassword: false,
        canViewPrivateKey: false,
        canRunSpeedTest: true,
        canRunHealthCheck: true,
      };
    });

    // Then, apply any existing access settings
    existingAccess.forEach(access => {
      initialAccess[access.serverId] = {
        hasAccess: true,
        canViewPassword: access.canViewPassword,
        canViewPrivateKey: access.canViewPrivateKey,
        canRunSpeedTest: access.canRunSpeedTest,
        canRunHealthCheck: access.canRunHealthCheck,
        accessId: access.id,
      };
    });

    setServerAccess(initialAccess);
  }, [servers, existingAccess]);

  const toggleAccess = (serverId: string) => {
    setServerAccess(prev => ({
      ...prev,
      [serverId]: {
        ...prev[serverId],
        hasAccess: !prev[serverId].hasAccess,
      }
    }));
  };

  const togglePermission = (serverId: string, permission: 'canViewPassword' | 'canViewPrivateKey' | 'canRunSpeedTest' | 'canRunHealthCheck') => {
    setServerAccess(prev => ({
      ...prev,
      [serverId]: {
        ...prev[serverId],
        [permission]: !prev[serverId][permission],
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Process server access changes
      const changes: Array<Promise<any>> = [];

      // Process each server
      for (const serverId in serverAccess) {
        const access = serverAccess[serverId];

        // If server has access
        if (access.hasAccess) {
          // If it's a new access, create it
          if (!access.accessId) {
            changes.push(
              fetch("/api/server-access", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: user.id,
                  serverId,
                  canViewPassword: access.canViewPassword,
                  canViewPrivateKey: access.canViewPrivateKey,
                  canRunSpeedTest: access.canRunSpeedTest,
                  canRunHealthCheck: access.canRunHealthCheck,
                }),
              })
            );
          } else {
            // If it's an existing access, update it
            changes.push(
              fetch(`/api/server-access/${access.accessId}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  canViewPassword: access.canViewPassword,
                  canViewPrivateKey: access.canViewPrivateKey,
                  canRunSpeedTest: access.canRunSpeedTest,
                  canRunHealthCheck: access.canRunHealthCheck,
                }),
              })
            );
          }
        } else if (access.accessId) {
          // If server no longer has access but did before, delete the access
          changes.push(
            fetch(`/api/server-access/${access.accessId}`, {
              method: "DELETE",
            })
          );
        }
      }

      // Execute all changes
      const results = await Promise.all(changes);

      // Check if any requests failed
      const failures = results.filter(res => !res.ok);
      if (failures.length > 0) {
        throw new Error(`${failures.length} changes failed to apply`);
      }

      toast.success("Server access updated!");
      router.refresh();
      router.push("/users");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Server
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Access
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  View Password
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  View Private Key
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Run Speed Test
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Run Health Check
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {servers.map(server => {
                const access = serverAccess[server.id] || {
                  hasAccess: false,
                  canViewPassword: false,
                  canViewPrivateKey: false,
                  canRunSpeedTest: true,
                  canRunHealthCheck: true,
                };

                return (
                  <tr key={server.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {server.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {server.ip} {server.domain && `(${server.domain})`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => toggleAccess(server.id)}
                        className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${access.hasAccess
                            ? "bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500 dark:bg-red-900 dark:text-red-200"
                          }`}
                      >
                        {access.hasAccess ? (
                          <FiCheck className="h-5 w-5" />
                        ) : (
                          <FiX className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={access.hasAccess && access.canViewPassword}
                        onChange={() => togglePermission(server.id, 'canViewPassword')}
                        disabled={!access.hasAccess || isLoading}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={access.hasAccess && access.canViewPrivateKey}
                        onChange={() => togglePermission(server.id, 'canViewPrivateKey')}
                        disabled={!access.hasAccess || isLoading}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={access.hasAccess && access.canRunSpeedTest}
                        onChange={() => togglePermission(server.id, 'canRunSpeedTest')}
                        disabled={!access.hasAccess || isLoading}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={access.hasAccess && access.canRunHealthCheck}
                        onChange={() => togglePermission(server.id, 'canRunHealthCheck')}
                        disabled={!access.hasAccess || isLoading}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push("/users")}
          disabled={isLoading}
          className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default UserServerAccess;