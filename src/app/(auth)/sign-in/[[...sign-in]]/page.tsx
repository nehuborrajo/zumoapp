import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function SignInPage() {
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
            Bienvenido de vuelta
          </h1>
          <p className="max-w-md text-lg text-white/80">
            Continúa tu racha de estudio y sigue progresando hacia tus metas académicas.
          </p>
          <div className="flex items-center gap-4 rounded-xl bg-white/10 p-4 backdrop-blur">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="font-semibold text-white">¡No pierdas tu racha!</p>
              <p className="text-sm text-white/70">Tu progreso te está esperando</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/60">
          © 2024 StudyBuddy. Todos los derechos reservados.
        </p>
      </div>

      {/* Right side - Sign In Form */}
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

          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent",
                headerTitle: "text-2xl font-bold",
                headerSubtitle: "text-gray-600 dark:text-gray-400",
                socialButtonsBlockButton:
                  "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
                formFieldInput:
                  "rounded-xl border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500",
                formButtonPrimary:
                  "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl",
                footerActionLink: "text-indigo-600 hover:text-indigo-500",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
