"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge, Progress, Button } from "@/components/ui";
import { UserProvider, useUser } from "@/contexts/UserContext";
import {
  BookOpen,
  Home,
  Folder,
  GraduationCap,
  Trophy,
  ShoppingBag,
  User,
  Menu,
  X,
  Flame,
  Coins,
  Star,
  Crown,
  LogOut,
  Loader2,
} from "lucide-react";

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Mis Cursos", href: "/containers", icon: Folder },
  { name: "Estudiar", href: "/study", icon: GraduationCap },
  { name: "Clasificación", href: "/leaderboard", icon: Trophy },
  { name: "Tienda", href: "/shop", icon: ShoppingBag },
  { name: "Perfil", href: "/profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Get user data from our database
  const { user, loading: userLoading, xpProgress, xpNeededForLevel, xpInCurrentLevel } = useUser();

  useEffect(() => {
    const loadSupabase = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const client = createClient();
      setSupabase(client);
      const { data: { user } } = await client.auth.getUser();
      setSupabaseUser(user);
    };
    loadSupabase();
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    }
  };

  // Use real user data or defaults
  const stats = {
    level: user?.level ?? 1,
    totalXp: user?.totalXp ?? 0,
    coins: user?.coins ?? 100,
    currentStreak: user?.currentStreak ?? 0,
    isPremium: user?.isPremium ?? false,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-white transition-transform duration-300 ease-in-out dark:bg-gray-900 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Zumo</span>
            </Link>
            <button
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User stats card */}
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
                    {userLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.level}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Nivel</p>
                    <p className="font-bold">{stats.totalXp} XP</p>
                  </div>
                </div>
                {stats.isPremium && (
                  <Badge variant="premium" size="sm">
                    <Crown className="h-3 w-3" />
                    PRO
                  </Badge>
                )}
              </div>
              <div className="mt-3">
                <Progress
                  value={xpProgress}
                  variant="xp"
                  size="sm"
                  className="bg-white/20"
                />
                <p className="mt-1 text-xs text-white/70">
                  {xpInCurrentLevel} / {xpNeededForLevel} XP para nivel {stats.level + 1}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {stats.currentStreak}
                  </p>
                  <p className="text-xs text-gray-500">Racha</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <Coins className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.coins}
                  </p>
                  <p className="text-xs text-gray-500">Monedas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-indigo-500")} />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="ml-auto h-2 w-2 rounded-full bg-indigo-500"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Premium upsell */}
          {!stats.isPremium && (
            <div className="border-t border-gray-200 p-4 dark:border-gray-800">
              <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  <span className="font-semibold">Hazte Premium</span>
                </div>
                <p className="mt-2 text-sm text-white/80">
                  Desbloquea todas las funciones y elimina anuncios.
                </p>
                <Link
                  href="/pricing"
                  className="mt-3 block rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                >
                  Ver planes
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/80 sm:px-6">
          <button
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search (optional) */}
          <div className="hidden flex-1 px-4 lg:block">
            {/* Can add search here later */}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Quick stats for desktop */}
            <div className="hidden items-center gap-4 md:flex">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">{stats.totalXp} XP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">{stats.currentStreak}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{stats.coins}</span>
              </div>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold"
              >
                {user?.displayName?.charAt(0).toUpperCase() ||
                 supabaseUser?.email?.charAt(0).toUpperCase() || "U"}
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                      <p className="text-sm font-medium">{user?.displayName || "Usuario"}</p>
                      <p className="text-xs text-gray-500">{user?.email || supabaseUser?.email}</p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <User className="h-4 w-4" />
                        Mi perfil
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
