"use client";

import { FiEdit, FiTrash } from "react-icons/fi";
import { RiSpeedMiniLine } from "react-icons/ri";
import Link from "next/link";
import RunServerHealthCheckButton from "./run-server-health-check-button";

interface ServerActionsProps {
  serverId: string;
  permissions?: {
    canViewPassword?: boolean;
    canViewPrivateKey?: boolean;
    canRunSpeedTest?: boolean;
    canRunHealthCheck?: boolean;
    isAdmin?: boolean;
  };
}

const ServerActions = ({
  serverId,
  permissions = {
    canRunSpeedTest: true,
    canRunHealthCheck: true,
    isAdmin: false
  }
}: ServerActionsProps) => {
  return (
    <div className="flex space-x-2">
      {permissions.canRunHealthCheck && (
        <RunServerHealthCheckButton serverId={serverId} />
      )}

      {permissions.canRunSpeedTest && (
        <Link
          href={`/servers/${serverId}/speedtest`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <RiSpeedMiniLine className="mr-2" />
          Run Speed Test
        </Link>
      )}

      {permissions.isAdmin && (
        <>
          <Link
            href={`/servers/${serverId}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <FiEdit className="mr-2" />
            Edit
          </Link>
          <Link
            href={`/servers/${serverId}/delete`}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <FiTrash className="mr-2" />
            Delete
          </Link>
        </>
      )}
    </div>
  );
};

export default ServerActions;