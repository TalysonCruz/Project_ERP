"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        toast.error("Email ou senha incorretos!");
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      const { token, user } = data;

      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}`;
      document.cookie = `role=${user.role}; path=/; max-age=${60 * 60 * 24}`;
      document.cookie = `name=${encodeURIComponent(
        user.name
      )}; path=/; max-age=${60 * 60 * 24}`;

      toast.success("Login feito com sucesso! Bem-vindo ao sistema.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      if (user.role === "ADMIN") router.push("/admin");
      else if (user.role === "MANAGER") router.push("/manager");
      else router.push("/vendedor");
    } catch (error) {
      toast.error("Erro inesperado, tente novamente mais tarde.");
      console.error(error);
    }
  };

  return (
    <Card className="w-full shadow-lg border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Digite suas credenciais para acessar sua conta
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-input border-border focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-input border-border focus:ring-2 focus:ring-ring"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              /> */}
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground"
              >
                admin@teste.com // password: 123456 trocar admin por manager ou
                vendedor para acessar outras contas
              </Label>
            </div>
            {/* <Button variant="link" className="px-0 text-sm text-accent hover:text-accent/80">
              Esqueceu a senha?
            </Button> */}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 p-2">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>

          {/* <div className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Button variant="link" className="px-0 text-accent hover:text-accent/80 font-medium">
              Cadastre-se
            </Button>
          </div> */}
        </CardFooter>
      </form>
    </Card>
  );
}
