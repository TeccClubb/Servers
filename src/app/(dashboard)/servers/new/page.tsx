import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnimatedServerForm } from "@/components/servers/animated-server-form";
import AnimatedDashboardLayout, { AnimatedSection } from "@/components/ui/animated-layout";

export default async function NewServerPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <AnimatedDashboardLayout>
      <AnimatedSection className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Add New Server
        </h1>
        <p className="text-gray-600 text-lg">
          Connect and monitor your VPS infrastructure
        </p>
      </AnimatedSection>

      <AnimatedSection>
        <AnimatedServerForm />
      </AnimatedSection>
    </AnimatedDashboardLayout>
  );
}