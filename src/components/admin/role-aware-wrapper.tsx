import type React from "react"

interface RoleAwareWrapperProps {
  children: React.ReactNode
  userRole: "ADMIN" | "MANAGER" | "VENDEDOR"
  allowedRoles: ("ADMIN" | "MANAGER" | "VENDEDOR")[]
  fallback?: React.ReactNode
}

export function RoleAwareWrapper({ children, userRole, allowedRoles, fallback = null }: RoleAwareWrapperProps) {
  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
