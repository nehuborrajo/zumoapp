"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { BookOpen, Mail, Lock, User, Loader2, Sparkles, Trophy, Brain } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
        },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8 dark:bg-gray-950">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">¡Revisa tu email!</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Te hemos enviado un enlace de confirmación a <strong>{email}</strong>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Haz clic en el enlace del email para activar tu cuenta y comenzar a estudiar.
            </p>
            <Link href="/sign-in">
              <Button variant="outline" className="mt-6">
                Volver a iniciar sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold">StudyBuddy</span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white">
            Empieza tu viaje de aprendizaje
          </h1>
          <p className="max-w-md text-lg text-white/80">
            Únete a miles de estudiantes que transforman sus apuntes en superpoderes con IA.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="rounded-lg bg-white/20 p-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">IA genera contenido</p>
                <p className="text-sm text-white/70">Flashcards y quizzes automáticos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="rounded-lg bg-white/20 p-2">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Gamificación</p>
                <p className="text-sm text-white/70">XP, niveles, rachas y logros</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="rounded-lg bg-white/20 p-2">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Aprende mejor</p>
                <p className="text-sm text-white/70">Repetición espaciada y más</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/60">
          © 2024 StudyBuddy. Todos los derechos reservados.
        </p>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="flex w-full items-center justify-center bg-gray-50 p-8 dark:bg-gray-950 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">StudyBuddy</span>
            </Link>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold">Crear cuenta</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Empieza gratis, sin tarjeta de crédito
                </p>
              </div>

              {/* Google Sign Up */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Registrarse con Google
              </Button>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span className="text-sm text-gray-500">o</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSignUp} className="space-y-4">
                <Input
                  type="text"
                  label="Nombre de usuario"
                  placeholder="tu_username"
                  icon={<User className="h-4 w-4" />}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  label="Email"
                  placeholder="tu@email.com"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  label="Contraseña"
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Crear cuenta gratis"
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                ¿Ya tienes cuenta?{" "}
                <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Inicia sesión
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
