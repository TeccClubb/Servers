"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { 
  FiLoader, 
  FiServer, 
  FiGlobe, 
  FiUser, 
  FiKey, 
  FiFlag,
  FiCheck,
  FiX,
  FiLink
} from "react-icons/fi";
import countryList from "@/lib/country-list";
import ReactCountryFlag from "react-country-flag";

interface ServerFormValues {
  name: string;
  ip: string;
  domain?: string;
  country: string;
  username?: string;
  password?: string;
  privateKey?: string;
}

interface AnimatedServerFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export const AnimatedServerForm = ({ initialData, isEditing = false }: AnimatedServerFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ServerFormValues>({
    defaultValues: initialData || {
      name: "",
      ip: "",
      domain: "",
      country: "",
      username: "",
      password: "",
      privateKey: "",
    },
  });

  const watchedCountry = watch("country");

  const onSubmit = async (data: ServerFormValues) => {
    try {
      setIsLoading(true);
      
      if (isEditing && initialData?.id) {
        const response = await fetch(`/api/servers/${initialData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update server");
        }
      } else {
        const response = await fetch("/api/servers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to create server");
        }
      }

      router.refresh();
      router.push("/servers");
      toast.success(isEditing ? "Server updated successfully! 🎉" : "Server created successfully! 🎉");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: FiServer },
    { number: 2, title: "Location", icon: FiFlag },
    { number: 3, title: "Access", icon: FiKey },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Progress Steps */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors duration-300 ${
                  currentStep >= step.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                <step.icon className="w-5 h-5" />
              </motion.div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  Step {step.number}
                </p>
                <p className={`text-xs ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Form */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Basic Information */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiServer className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Server Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="space-y-2"
              >
                <label htmlFor="name" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FiServer className="w-4 h-4" />
                  <span>Server Name <span className="text-red-500">*</span></span>
                </label>
                <input
                  id="name"
                  type="text"
                  disabled={isLoading}
                  {...register("name", { required: "Server name is required" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="My Production Server"
                />
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-red-500 flex items-center"
                  >
                    <FiX className="w-4 h-4 mr-1" />
                    {errors.name.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="space-y-2"
              >
                <label htmlFor="ip" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FiGlobe className="w-4 h-4" />
                  <span>IP Address <span className="text-red-500">*</span></span>
                </label>
                <input
                  id="ip"
                  type="text"
                  disabled={isLoading}
                  {...register("ip", { required: "IP address is required" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="192.168.1.100"
                />
                {errors.ip && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-red-500 flex items-center"
                  >
                    <FiX className="w-4 h-4 mr-1" />
                    {errors.ip.message}
                  </motion.p>
                )}
              </motion.div>
              
              {/* Domain Field */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="space-y-2"
              >
                <label htmlFor="domain" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiLink className="w-4 h-4" />
                  <span>Domain Name</span>
                </label>
                <input
                  id="domain"
                  type="text"
                  disabled={isLoading}
                  {...register("domain")}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-gray-100"
                  placeholder="example.com"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Step 2: Location */}
          <motion.div variants={itemVariants} className="space-y-6 border-t border-gray-100 pt-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiFlag className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Server Location</h3>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-2"
            >
              <label htmlFor="country" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <FiFlag className="w-4 h-4" />
                <span>Country <span className="text-red-500">*</span></span>
              </label>
              <div className="relative">
                <select
                  id="country"
                  disabled={isLoading}
                  {...register("country", { required: "Country is required" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none"
                >
                  <option value="">Select a country</option>
                  {countryList.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {watchedCountry && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2"
                  >
                    <div className="w-6 h-4 rounded-sm overflow-hidden shadow-sm border border-gray-200 bg-white">
                      <ReactCountryFlag
                        countryCode={watchedCountry}
                        svg
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
              {errors.country && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <FiX className="w-4 h-4 mr-1" />
                  {errors.country.message}
                </motion.p>
              )}
            </motion.div>
          </motion.div>

          {/* Step 3: Access Credentials */}
          <motion.div variants={itemVariants} className="space-y-6 border-t border-gray-100 pt-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiKey className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Access Credentials</h3>
              <span className="text-sm text-gray-500">(Optional)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="space-y-2"
              >
                <label htmlFor="username" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FiUser className="w-4 h-4" />
                  <span>Username</span>
                </label>
                <input
                  id="username"
                  type="text"
                  disabled={isLoading}
                  {...register("username")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="root"
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="space-y-2"
              >
                <label htmlFor="password" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FiKey className="w-4 h-4" />
                  <span>Password</span>
                </label>
                <input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  {...register("password")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="••••••••"
                />
              </motion.div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="space-y-2"
            >
              <label htmlFor="privateKey" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <FiKey className="w-4 h-4" />
                <span>Private Key (SSH)</span>
              </label>
              <textarea
                id="privateKey"
                rows={6}
                disabled={isLoading}
                {...register("privateKey")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
              />
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-100"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isLoading}
              onClick={() => router.back()}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center transition-all duration-200"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <FiLoader className="w-4 h-4" />
                </motion.div>
              ) : (
                <FiCheck className="mr-2 w-4 h-4" />
              )}
              {isEditing ? "Update Server" : "Create Server"}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};