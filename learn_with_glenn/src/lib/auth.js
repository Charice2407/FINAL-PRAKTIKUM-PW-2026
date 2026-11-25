// Backward-compatible aliases for server-side authentication helpers.
export {
  getAuthenticatedUser as getCurrentUser,
  requireUserRole as requireRole,
} from "@/lib/server-auth";
