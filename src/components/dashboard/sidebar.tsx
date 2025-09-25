import Link from "next/link";
import { FiMonitor, FiServer, FiLogOut, FiUsers } from "react-icons/fi";
import { signOut, auth } from "@/lib/auth";

const Sidebar = async () => {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  
  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: FiMonitor,
    },
    {
      href: "/servers",
      label: "Servers",
      icon: FiServer,
    },
    ...(isAdmin ? [
      {
        href: "/users",
        label: "Users",
        icon: FiUsers,
      }
    ] : []),
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <img src="/logo.png" alt="Logo" />
          </div>
          <h1 className="text-2xl font-bold">
            TecClub Monitor
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <div className="flex items-center flex-1">
                <route.icon className="h-5 w-5 mr-3" />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center p-3 text-sm group font-medium cursor-pointer hover:text-white hover:bg-red-600 dark:hover:bg-red-700 rounded-lg transition text-gray-700 dark:text-gray-300"
          >
            <FiLogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;