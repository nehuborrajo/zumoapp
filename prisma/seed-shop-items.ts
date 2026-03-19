// Seed script for shop items
// Run with: npx tsx prisma/seed-shop-items.ts

import { PrismaClient, ShopCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create Prisma client with adapter
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const shopItems: {
  category: ShopCategory;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  isPremiumOnly: boolean;
  properties: Record<string, unknown>;
}[] = [
  // ==================== CONSUMABLES ====================
  {
    category: "CONSUMABLE",
    name: "Streak Freeze",
    description: "Protege tu racha por 1 día si no estudias. Se usa automáticamente.",
    imageUrl: "/shop/streak-freeze.png",
    price: 200,
    isPremiumOnly: false,
    properties: {
      type: "streak_freeze",
      duration: 1, // days
    },
  },
  {
    category: "CONSUMABLE",
    name: "Pack de 3 Streak Freezes",
    description: "3 protectores de racha. ¡Ahorra 100 monedas!",
    imageUrl: "/shop/streak-freeze-pack.png",
    price: 500,
    isPremiumOnly: false,
    properties: {
      type: "streak_freeze",
      quantity: 3,
    },
  },
  {
    category: "CONSUMABLE",
    name: "XP Boost x2 (1 hora)",
    description: "Duplica el XP ganado durante 1 hora.",
    imageUrl: "/shop/xp-boost-1h.png",
    price: 150,
    isPremiumOnly: false,
    properties: {
      type: "xp_boost",
      multiplier: 2,
      durationMinutes: 60,
    },
  },
  {
    category: "CONSUMABLE",
    name: "XP Boost x2 (3 horas)",
    description: "Duplica el XP ganado durante 3 horas. ¡Ideal para sesiones largas!",
    imageUrl: "/shop/xp-boost-3h.png",
    price: 350,
    isPremiumOnly: false,
    properties: {
      type: "xp_boost",
      multiplier: 2,
      durationMinutes: 180,
    },
  },
  {
    category: "CONSUMABLE",
    name: "XP Boost x3 (1 hora)",
    description: "¡Triplica el XP ganado durante 1 hora!",
    imageUrl: "/shop/xp-boost-3x.png",
    price: 300,
    isPremiumOnly: true,
    properties: {
      type: "xp_boost",
      multiplier: 3,
      durationMinutes: 60,
    },
  },

  // ==================== THEMES ====================
  {
    category: "THEME",
    name: "Tema Oscuro Puro",
    description: "Un tema oscuro con negro puro para máximo contraste.",
    imageUrl: "/shop/theme-dark.png",
    price: 500,
    isPremiumOnly: false,
    properties: {
      themeId: "dark-pure",
      colors: {
        primary: "#8b5cf6",
        background: "#000000",
        surface: "#111111",
      },
    },
  },
  {
    category: "THEME",
    name: "Tema Océano",
    description: "Tonos azules relajantes inspirados en el mar.",
    imageUrl: "/shop/theme-ocean.png",
    price: 500,
    isPremiumOnly: false,
    properties: {
      themeId: "ocean",
      colors: {
        primary: "#0ea5e9",
        background: "#0c1929",
        surface: "#0f2942",
      },
    },
  },
  {
    category: "THEME",
    name: "Tema Bosque",
    description: "Verdes naturales para una experiencia tranquila.",
    imageUrl: "/shop/theme-forest.png",
    price: 500,
    isPremiumOnly: false,
    properties: {
      themeId: "forest",
      colors: {
        primary: "#22c55e",
        background: "#0a1f0a",
        surface: "#132613",
      },
    },
  },
  {
    category: "THEME",
    name: "Tema Atardecer",
    description: "Cálidos tonos naranjas y rosados.",
    imageUrl: "/shop/theme-sunset.png",
    price: 500,
    isPremiumOnly: false,
    properties: {
      themeId: "sunset",
      colors: {
        primary: "#f97316",
        background: "#1a0a0a",
        surface: "#2d1515",
      },
    },
  },
  {
    category: "THEME",
    name: "Tema Neón",
    description: "Colores vibrantes estilo cyberpunk. ¡Brilla!",
    imageUrl: "/shop/theme-neon.png",
    price: 750,
    isPremiumOnly: false,
    properties: {
      themeId: "neon",
      colors: {
        primary: "#f0abfc",
        background: "#0a0a1a",
        surface: "#1a1a2e",
        accent: "#22d3ee",
      },
    },
  },
  {
    category: "THEME",
    name: "Tema Dorado",
    description: "Elegante tema con acentos dorados. Solo para los más dedicados.",
    imageUrl: "/shop/theme-gold.png",
    price: 1500,
    isPremiumOnly: true,
    properties: {
      themeId: "gold",
      colors: {
        primary: "#fbbf24",
        background: "#1a1400",
        surface: "#2d2400",
      },
    },
  },

  // ==================== POWERUPS (permanentes pero no consumibles) ====================
  {
    category: "POWERUP",
    name: "Más Monedas por Sesión",
    description: "Gana un 25% más de monedas en cada sesión de estudio. Permanente.",
    imageUrl: "/shop/coin-boost.png",
    price: 2000,
    isPremiumOnly: false,
    properties: {
      type: "coin_multiplier",
      multiplier: 1.25,
    },
  },
  {
    category: "POWERUP",
    name: "Protección de Racha Semanal",
    description: "Obtén 1 streak freeze gratis cada semana. Permanente.",
    imageUrl: "/shop/weekly-freeze.png",
    price: 3000,
    isPremiumOnly: true,
    properties: {
      type: "weekly_freeze",
      freezesPerWeek: 1,
    },
  },
];

async function main() {
  console.log("Seeding shop items...");

  for (const item of shopItems) {
    const existing = await prisma.shopItem.findFirst({
      where: { name: item.name },
    });

    if (existing) {
      console.log(`  Updating: ${item.name}`);
      await prisma.shopItem.update({
        where: { id: existing.id },
        data: {
          category: item.category,
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          price: item.price,
          isPremiumOnly: item.isPremiumOnly,
          properties: item.properties as object,
        },
      });
    } else {
      console.log(`  Creating: ${item.name}`);
      await prisma.shopItem.create({
        data: {
          category: item.category,
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          price: item.price,
          isPremiumOnly: item.isPremiumOnly,
          properties: item.properties as object,
        },
      });
    }
  }

  console.log(`\nSeeded ${shopItems.length} shop items!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
