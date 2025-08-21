"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Package, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // const handleLogout = () => {
  //   Cookies.remove("token");
  //   Cookies.remove("role");
  //   Cookies.remove("name");

  //   toast.success("Logout realizado com sucesso!");
  //   router.push("/");
  // };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="font-bold">Sistema de Inventário</span>
          </div>

          {/* <div className="ml-auto flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div> */}
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">{children}</main>
    </div>
  );
}
