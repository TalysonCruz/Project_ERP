import { LoginForm } from "@/components/login/login";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* <h1 className="text-3xl font-bold text-foreground mb-2">Bem-vindo</h1>
          <p className="text-muted-foreground">
            Entre na sua conta para continuar
          </p> */}
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
