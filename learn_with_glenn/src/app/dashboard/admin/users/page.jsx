import { redirect } from "next/navigation";
import { requireUserRole } from "@/lib/server-auth";
import UserManagementClient from "./UserManagementClient";

export default async function UserManagementPage() {
  const user = await requireUserRole(["admin"]);

  if (!user) redirect("/login");

  return <UserManagementClient />;
}
