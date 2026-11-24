import { redirect } from "next/navigation";
import { requireUserRole } from "@/lib/server-auth";
import CategoryManagementClient from "./CategoryManagementClient";

export default async function CategoryManagementPage() {
  const user = await requireUserRole(["admin"]);

  if (!user) redirect("/login");

  return <CategoryManagementClient />;
}
