import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { ServerForm } from "@/components/servers/server-form";

interface ServerEditPageProps {
  params: {
    serverId: string;
  };
}

export default async function ServerEditPage({ params }: ServerEditPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { serverId } = await params;

  const server = await prismadb.server.findUnique({
    where: {
      id: serverId
    }
  });

  if (!server) {
    redirect("/servers");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Server</h1>
        <p className="text-muted-foreground">
          Update server information
        </p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <ServerForm initialData={server} isEditing />
      </div>
    </div>
  );
}