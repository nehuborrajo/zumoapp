"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import {
  ShoppingBag,
  Coins,
  Crown,
  Sparkles,
  Check,
  Lock,
  Filter,
} from "lucide-react";

// Mock shop data
const categories = [
  { id: "all", name: "Todo", icon: ShoppingBag },
  { id: "avatar_head", name: "Cabeza", icon: "👒" },
  { id: "avatar_body", name: "Ropa", icon: "👕" },
  { id: "avatar_accessory", name: "Accesorios", icon: "🎒" },
  { id: "avatar_background", name: "Fondos", icon: "🌅" },
  { id: "powerup", name: "Power-ups", icon: "⚡" },
];

const shopItems = [
  // Avatars - Head
  { id: "1", name: "Gorro de Mago", category: "avatar_head", price: 150, image: "🧙", isPremiumOnly: false, owned: false },
  { id: "2", name: "Corona Dorada", category: "avatar_head", price: 500, image: "👑", isPremiumOnly: true, owned: false },
  { id: "3", name: "Gafas de Sol", category: "avatar_head", price: 100, image: "😎", isPremiumOnly: false, owned: true },
  { id: "4", name: "Sombrero Pirata", category: "avatar_head", price: 200, image: "🏴‍☠️", isPremiumOnly: false, owned: false },

  // Avatars - Body
  { id: "5", name: "Capa de Héroe", category: "avatar_body", price: 300, image: "🦸", isPremiumOnly: false, owned: false },
  { id: "6", name: "Traje Espacial", category: "avatar_body", price: 450, image: "👨‍🚀", isPremiumOnly: true, owned: false },
  { id: "7", name: "Uniforme Ninja", category: "avatar_body", price: 250, image: "🥷", isPremiumOnly: false, owned: false },

  // Accessories
  { id: "8", name: "Mochila Cohete", category: "avatar_accessory", price: 400, image: "🚀", isPremiumOnly: false, owned: false },
  { id: "9", name: "Mascota Dragón", category: "avatar_accessory", price: 600, image: "🐉", isPremiumOnly: true, owned: false },
  { id: "10", name: "Espada Láser", category: "avatar_accessory", price: 350, image: "⚔️", isPremiumOnly: false, owned: true },

  // Backgrounds
  { id: "11", name: "Espacio Exterior", category: "avatar_background", price: 200, image: "🌌", isPremiumOnly: false, owned: false },
  { id: "12", name: "Bosque Mágico", category: "avatar_background", price: 200, image: "🌲", isPremiumOnly: false, owned: false },
  { id: "13", name: "Ciudad Futurista", category: "avatar_background", price: 300, image: "🏙️", isPremiumOnly: true, owned: false },

  // Power-ups
  { id: "14", name: "Congelar Racha (1 día)", category: "powerup", price: 50, image: "❄️", isPremiumOnly: false, owned: false, quantity: 3 },
  { id: "15", name: "XP Boost x2 (1 hora)", category: "powerup", price: 100, image: "⚡", isPremiumOnly: false, owned: false, quantity: 1 },
  { id: "16", name: "Monedas x2 (1 día)", category: "powerup", price: 150, image: "💰", isPremiumOnly: false, owned: false, quantity: 0 },
];

const userCoins = 340;
const isPremium = false;

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [purchaseModal, setPurchaseModal] = useState<string | null>(null);

  const filteredItems = shopItems.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const selectedItem = shopItems.find((item) => item.id === purchaseModal);

  const canAfford = (price: number) => userCoins >= price;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Tienda</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Personaliza tu avatar y consigue power-ups
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-yellow-100 px-4 py-2 dark:bg-yellow-900/30">
          <Coins className="h-5 w-5 text-yellow-600" />
          <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
            {userCoins}
          </span>
          <span className="text-sm text-yellow-600 dark:text-yellow-500">monedas</span>
        </div>
      </div>

      {/* Premium banner */}
      {!isPremium && (
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
                className="bg-white text-orange-600 hover:bg-orange-50"
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
            {typeof cat.icon === "string" ? (
              <span>{cat.icon}</span>
            ) : (
              <cat.icon className="h-4 w-4" />
            )}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredItems.map((item, index) => {
          const canBuy = canAfford(item.price) && !item.owned && (!item.isPremiumOnly || isPremium);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`relative overflow-hidden transition-all ${
                  item.owned
                    ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20"
                    : "card-hover cursor-pointer"
                }`}
                onClick={() => !item.owned && setPurchaseModal(item.id)}
              >
                {/* Premium badge */}
                {item.isPremiumOnly && (
                  <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-semibold text-white">
                    <Crown className="inline h-3 w-3" /> PRO
                  </div>
                )}

                {/* Owned badge */}
                {item.owned && (
                  <div className="absolute left-2 top-2">
                    <Badge variant="success" size="sm">
                      <Check className="h-3 w-3" />
                      Obtenido
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Item image */}
                  <div className="flex justify-center">
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-2xl text-5xl ${
                        item.owned
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      {item.image}
                    </div>
                  </div>

                  {/* Item info */}
                  <div className="mt-4 text-center">
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.quantity !== undefined && (
                      <p className="text-sm text-gray-500">
                        Tienes: {item.quantity}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  {!item.owned && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {item.isPremiumOnly && !isPremium ? (
                        <Badge variant="warning">
                          <Lock className="h-3 w-3" />
                          Solo Premium
                        </Badge>
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
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Purchase Modal */}
      {purchaseModal && selectedItem && (
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
                {selectedItem.image}
              </div>
              <h2 className="mt-4 text-xl font-bold">{selectedItem.name}</h2>

              {selectedItem.isPremiumOnly && !isPremium ? (
                <>
                  <p className="mt-2 text-gray-500">
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
                    <span className="text-2xl font-bold">{selectedItem.price}</span>
                  </div>

                  {!canAfford(selectedItem.price) && (
                    <p className="mt-2 text-sm text-red-500">
                      No tienes suficientes monedas
                    </p>
                  )}

                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPurchaseModal(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={!canAfford(selectedItem.price)}
                    >
                      <Sparkles className="h-4 w-4" />
                      Comprar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
