"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  // Use client-side redirection to avoid potential redirect loops
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-xl font-medium text-gray-600">Loading...</h1>
        <p className="mt-2 text-gray-500">Please wait while we redirect you</p>
      </div>
    </div>
  );
}
