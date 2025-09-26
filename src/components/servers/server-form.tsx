"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FiLoader } from "react-icons/fi";
import countryList from "@/lib/country-list";

interface ServerFormValues {
  name: string;
  ip: string;
  country: string;
  username?: string;
  password?: string;
  privateKey?: string;
}

interface ServerFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export const ServerForm = ({ initialData, isEditing = false }: ServerFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServerFormValues>({
    defaultValues: initialData || {
      name: "",
      ip: "",
      country: "",
      username: "",
      password: "",
      privateKey: "",
    },
  });

  const onSubmit = async (data: ServerFormValues) => {
    try {
      setIsLoading(true);

      if (isEditing && initialData?.id) {
        // Update existing server
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
        // Create new server
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
      toast.success(isEditing ? "Server updated!" : "Server created!");
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Server Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              disabled={isLoading}
              {...register("name", { required: "Server name is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="ip"
              className="block text-sm font-medium text-gray-700"
            >
              IP Address <span className="text-red-500">*</span>
            </label>
            <input
              id="ip"
              type="text"
              disabled={isLoading}
              {...register("ip", { required: "IP address is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.ip && (
              <p className="text-sm text-red-500">{errors.ip.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            Country <span className="text-red-500">*</span>
          </label>
          <select
            id="country"
            disabled={isLoading}
            {...register("country", { required: "Country is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a country</option>
            {countryList.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-sm text-red-500">{errors.country.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              disabled={isLoading}
              {...register("username")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              disabled={isLoading}
              {...register("password")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="privateKey"
            className="block text-sm font-medium text-gray-700"
          >
            Private Key (SSH)
          </label>
          <textarea
            id="privateKey"
            rows={5}
            disabled={isLoading}
            {...register("privateKey")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
        >
          {isLoading && <FiLoader className="mr-2 animate-spin" />}
          {isEditing ? "Update Server" : "Create Server"}
        </button>
      </div>
    </form>
  );
};