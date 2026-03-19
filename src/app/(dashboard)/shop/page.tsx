"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { shopAPI, type ShopItem } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import {
  ShoppingBag,
  Coins,
  Crown,
  Sparkles,
  Check,
  Lock,
  Loader2,
  Flame,
  Zap,
  Palette,
  Package,
  X,
  Play,
  Clock,
} from "lucide-react";

type CategoryFilter = "all" | "CONSUMABLE" | "THEME" | "POWERUP";

const categories: { id: CategoryFilter; name: string; icon: React.ReactNode }[] = [
  { id: "all", name: "Todo", icon: <ShoppingBag className="h-4 w-4" /> },
  { id: "CONSUMABLE", name: "Consumibles", icon: <Zap className="h-4 w-4" /> },
  { id: "THEME", name: "Temas", icon: <Palette className="h-4 w-4" /> },
  { id: "POWERUP", name: "Mejoras", icon: <Package className="h-4 w-4" /> },
];

const getItemIcon = (item: ShopItem): string => {
  const props = item.properties as Record<string, unknown>;
  const type = props.type as string;

  if (type === "streak_freeze") return "❄️";
  if (type === "xp_boost") {
    const mult = props.multiplier as number;
    return mult >= 3 ? "⚡" : "🚀";
  }
  if (type === "coin_multiplier") return "💰";
  if (type === "weekly_freeze") return "🛡️";
  if (item.category === "THEME") {
    const themeId = props.themeId as string;
    if (themeId === "dark-pure") return "🌑";
    if (themeId === "ocean") return "🌊";
    if (themeId === "forest") return "🌲";
    if (themeId === "sunset") return "🌅";
    if (themeId === "neon") return "💜";
    if (themeId === "gold") return "✨";
  }
  return "🎁";
};

export default function ShopPage() {
  const { user, refetch: refetchUser } = useUser();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [purchaseModal, setPurchaseModal] = useState<ShopItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active boosts state
  const [xpBoostActive, setXpBoostActive] = useState(false);
  const [xpBoostUntil, setXpBoostUntil] = useState<string | null>(null);
  const [xpBoostMultiplier, setXpBoostMultiplier] = useState(1);
  const [streakFreezes, setStreakFreezes] = useState(0);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const [shopData, inventoryData] = await Promise.all([
        shopAPI.getItems(),
        shopAPI.getInventory(),
      ]);
      console.log("Shop data:", shopData);
      console.log("Inventory data:", inventoryData);
      setItems(shopData.items);
      setXpBoostActive(inventoryData.xpBoostActive);
      setXpBoostUntil(inventoryData.xpBoostUntil);
      setXpBoostMultiplier(inventoryData.xpBoostMultiplier);
      setStreakFreezes(inventoryData.streakFreezes);
    } catch (err) {
      console.error("Error fetching shop:", err);
      setErrorMessage(err instanceof Error ? err.message : "Error cargando tienda");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!purchaseModal) return;

    try {
      setPurchasing(true);
      setErrorMessage(null);
      const result = await shopAPI.buyItem(purchaseModal.id);
      setSuccessMessage(result.message);
      setPurchaseModal(null);
      await Promise.all([fetchShopData(), refetchUser()]);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al comprar");
    } finally {
      setPurchasing(false);
    }
  };

  const handleUseItem = async (item: ShopItem) => {
    try {
      setErrorMessage(null);
      const result = await shopAPI.useItem(item.id);
      setSuccessMessage(result.message);
      await fetchShopData();

      if (result.xpBoostUntil) {
        setXpBoostActive(true);
        setXpBoostUntil(result.xpBoostUntil);
        setXpBoostMultiplier(result.xpBoostMultiplier || 2);
      }
      if (result.streakFreezes !== undefined) {
        setStreakFreezes(result.streakFreezes);
      }

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al usar item");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleEquipTheme = async (item: ShopItem) => {
    try {
      setErrorMessage(null);
      const result = await shopAPI.equipItem(item.id);
      setSuccessMessage(result.message);
      await fetchShopData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al equipar tema");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const filteredItems = items.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const canAfford = (price: number) => (user?.coins || 0) >= price;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Tienda</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Consigue power-ups y personaliza tu experiencia
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-yellow-100 px-4 py-2 dark:bg-yellow-900/30">
          <Coins className="h-5 w-5 text-yellow-600" />
          <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
            {user?.coins || 0}
          </span>
          <span className="text-sm text-yellow-600 dark:text-yellow-500">monedas</span>
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          >
            <Check className="mr-2 inline h-5 w-5" />
            {successMessage}
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          >
            <X className="mr-2 inline h-5 w-5" />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Boosts */}
      {(xpBoostActive || streakFreezes > 0) && (
        <Card className="border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20">
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold text-indigo-700 dark:text-indigo-400">
              Tus beneficios activos
            </h3>
            <div className="flex flex-wrap gap-3">
              {xpBoostActive && xpBoostUntil && (
                <div className="flex items-center gap-2 rounded-lg bg-indigo-100 px-3 py-2 dark:bg-indigo-900/50">
                  <Zap className="h-5 w-5 text-indigo-600" />
                  <div>
                    <span className="font-medium text-indigo-700 dark:text-indigo-300">
                      XP Boost x{xpBoostMultiplier}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-indigo-500">
                      <Clock className="h-3 w-3" />
                      Hasta {new Date(xpBoostUntil).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              )}
              {streakFreezes > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-cyan-100 px-3 py-2 dark:bg-cyan-900/50">
                  <Flame className="h-5 w-5 text-cyan-600" />
                  <div>
                    <span className="font-medium text-cyan-700 dark:text-cyan-300">
                      Streak Freezes
                    </span>
                    <div className="text-xs text-cyan-500">
                      {streakFreezes} disponibles
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium banner */}
      {!user?.isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-white/20 p-3">
                  <Crown className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Desbloquea items exclusivos</h3>
                  <p className="text-white/80">
                    Hazte Premium y accede a todos los items de la tienda
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="hidden bg-white text-orange-600 hover:bg-orange-50 sm:flex"
              >
                Ver planes
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredItems.map((item, index) => {
          const props = item.properties as Record<string, unknown>;
          const isConsumable = item.category === "CONSUMABLE";
          const isTheme = item.category === "THEME";
          const canBuy = canAfford(item.price) && (!item.isPremiumOnly || user?.isPremium);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`relative h-56 overflow-hidden transition-all ${
                  item.owned && !isConsumable
                    ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20"
                    : item.isEquipped
                    ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-700 dark:bg-indigo-900/20"
                    : "card-hover cursor-pointer"
                }`}
                onClick={() => {
                  if (!item.owned || isConsumable) {
                    setPurchaseModal(item);
                  }
                }}
              >
                {/* Premium badge */}
                {item.isPremiumOnly && (
                  <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-semibold text-white">
                    <Crown className="inline h-3 w-3" /> PRO
                  </div>
                )}

                {/* Owned/Equipped badge */}
                {item.owned && !isConsumable && (
                  <div className="absolute left-2 top-2">
                    <Badge variant={item.isEquipped ? "default" : "success"} size="sm">
                      <Check className="h-3 w-3" />
                      {item.isEquipped ? "Equipado" : "Obtenido"}
                    </Badge>
                  </div>
                )}

                <CardContent className="flex h-full flex-col p-4">
                  {/* Item image */}
                  <div className="flex justify-center">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl text-3xl ${
                        item.owned && !isConsumable
                          ? "bg-green-100 dark:bg-green-900/30"
                          : item.isEquipped
                          ? "bg-indigo-100 dark:bg-indigo-900/30"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      {getItemIcon(item)}
                    </div>
                  </div>

                  {/* Item info */}
                  <div className="mt-2 flex-1 text-center">
                    <h3 className="text-sm font-semibold">{item.name}</h3>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {item.description}
                      </p>
                    )}
                    {isConsumable && item.owned && (
                      <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        Tienes: {item.quantity}
                      </p>
                    )}
                  </div>

                  {/* Price or action */}
                  <div className="mt-auto flex items-center justify-center gap-2 pt-2">
                    {item.isPremiumOnly && !user?.isPremium ? (
                      <Badge variant="warning">
                        <Lock className="h-3 w-3" />
                        Solo Premium
                      </Badge>
                    ) : item.owned && isTheme ? (
                      <Button
                        size="sm"
                        variant={item.isEquipped ? "outline" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquipTheme(item);
                        }}
                      >
                        {item.isEquipped ? "Equipado" : "Equipar"}
                      </Button>
                    ) : item.owned && isConsumable && item.quantity > 0 ? (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseItem(item);
                        }}
                      >
                        <Play className="h-3 w-3" />
                        Usar
                      </Button>
                    ) : (
                      <div
                        className={`flex items-center gap-1 rounded-lg px-3 py-1 ${
                          canAfford(item.price)
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                        }`}
                      >
                        <Coins className="h-4 w-4" />
                        <span className="font-bold">{item.price}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No hay items en esta categoría
        </div>
      )}

      {/* Purchase Modal */}
      <AnimatePresence>
        {purchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setPurchaseModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-100 text-6xl dark:bg-gray-800">
                  {getItemIcon(purchaseModal)}
                </div>
                <h2 className="mt-4 text-xl font-bold">{purchaseModal.name}</h2>
                {purchaseModal.description && (
                  <p className="mt-2 text-sm text-gray-500">{purchaseModal.description}</p>
                )}

                {purchaseModal.isPremiumOnly && !user?.isPremium ? (
                  <>
                    <p className="mt-4 text-gray-500">
                      Este item es exclusivo para usuarios Premium
                    </p>
                    <Button className="mt-6 w-full" variant="premium">
                      <Crown className="h-4 w-4" />
                      Hazte Premium
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="text-2xl font-bold">{purchaseModal.price}</span>
                    </div>

                    {!canAfford(purchaseModal.price) && (
                      <p className="mt-2 text-sm text-red-500">
                        No tienes suficientes monedas (tienes {user?.coins || 0})
                      </p>
                    )}

                    <div className="mt-6 flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setPurchaseModal(null)}
                        disabled={purchasing}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={!canAfford(purchaseModal.price) || purchasing}
                        onClick={handlePurchase}
                      >
                        {purchasing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Comprar
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
