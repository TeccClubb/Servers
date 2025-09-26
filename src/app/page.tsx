import { redirect } from "next/navigation";

// The middleware will handle redirection based on authentication state
export default function Home() {
  // This simplifies the logic since middleware will handle the redirection
  redirect("/login");
}
