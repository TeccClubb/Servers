"use client";

import Link from "next/link";
import { FiMenu, FiBell, FiUser, FiLogOut, FiMonitor, FiServer, FiUsers, FiX } from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import Logo from "@/components/ui/logo";
import ThemeToggle from "@/components/ui/theme-toggle";
import { useState } from "react";

const Header = () => {
  const { data: session, status } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't render anything while loading session
  if (status === "loading") {
    return (
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="animate-pulse h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white dark:bg-gray-900 shadow-lg p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-2">
                  <img src="/logo.png" alt="Logo" />
                </div>
                <span className="text-xl font-bold">TecClub Monitor</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-600 dark:text-gray-400"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <nav className="space-y-3">
              <Link 
                href="/dashboard" 
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiMonitor className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              
              <Link 
                href="/servers" 
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiServer className="mr-3 h-5 w-5" />
                Servers
              </Link>
              
              {session?.user?.role === "ADMIN" && (
                <Link 
                  href="/users" 
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiUsers className="mr-3 h-5 w-5" />
                  Users
                </Link>
              )}
            </nav>
            
            <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut();
                }}
                className="flex w-full items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <FiLogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Logo - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex">
          <Logo />
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            Dashboard
          </Link>
          <Link href="/servers" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            Servers
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link href="/users" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              Users
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="relative text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <FiBell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FiUser className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session?.user?.email || "admin@tecclub.com"}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 animate-in slide-in-from-top-2 duration-200">
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <FiUser className="mr-3 h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <FiLogOut className="mr-3 h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;