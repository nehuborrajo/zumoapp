// Seed script for initial achievements
// Run with: npx tsx prisma/seed-achievements.ts

import { PrismaClient } from "@prisma/client";
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

const achievements = [
  // First steps
  {
    code: "first_session",
    name: "Primer Paso",
    description: "Completa tu primera sesión de estudio",
    requirement: { type: "first_session", value: 1 },
    rewardCoins: 50,
    rewardXp: 25,
    rarity: "COMMON",
  },
  {
    code: "sessions_10",
    name: "Estudiante Dedicado",
    description: "Completa 10 sesiones de estudio",
    requirement: { type: "sessions", value: 10 },
    rewardCoins: 100,
    rewardXp: 50,
    rarity: "COMMON",
  },
  {
    code: "sessions_50",
    name: "Máquina de Aprender",
    description: "Completa 50 sesiones de estudio",
    requirement: { type: "sessions", value: 50 },
    rewardCoins: 250,
    rewardXp: 150,
    rarity: "RARE",
  },
  {
    code: "sessions_100",
    name: "Maestro del Estudio",
    description: "Completa 100 sesiones de estudio",
    requirement: { type: "sessions", value: 100 },
    rewardCoins: 500,
    rewardXp: 300,
    rarity: "EPIC",
  },

  // Streaks
  {
    code: "streak_3",
    name: "En Racha",
    description: "Mantén una racha de 3 días",
    requirement: { type: "streak", value: 3 },
    rewardCoins: 75,
    rewardXp: 50,
    rarity: "COMMON",
  },
  {
    code: "streak_7",
    name: "Semana Perfecta",
    description: "Mantén una racha de 7 días",
    requirement: { type: "streak", value: 7 },
    rewardCoins: 150,
    rewardXp: 100,
    rarity: "RARE",
  },
  {
    code: "streak_30",
    name: "Hábito Formado",
    description: "Mantén una racha de 30 días",
    requirement: { type: "streak", value: 30 },
    rewardCoins: 500,
    rewardXp: 300,
    rarity: "EPIC",
  },
  {
    code: "streak_100",
    name: "Leyenda de la Constancia",
    description: "Mantén una racha de 100 días",
    requirement: { type: "streak", value: 100 },
    rewardCoins: 1000,
    rewardXp: 500,
    rarity: "LEGENDARY",
  },

  // XP milestones
  {
    code: "xp_500",
    name: "Aprendiz",
    description: "Acumula 500 XP en total",
    requirement: { type: "xp", value: 500 },
    rewardCoins: 50,
    rewardXp: 25,
    rarity: "COMMON",
  },
  {
    code: "xp_2500",
    name: "Estudiante Avanzado",
    description: "Acumula 2,500 XP en total",
    requirement: { type: "xp", value: 2500 },
    rewardCoins: 150,
    rewardXp: 75,
    rarity: "RARE",
  },
  {
    code: "xp_10000",
    name: "Erudito",
    description: "Acumula 10,000 XP en total",
    requirement: { type: "xp", value: 10000 },
    rewardCoins: 400,
    rewardXp: 200,
    rarity: "EPIC",
  },
  {
    code: "xp_50000",
    name: "Sabio Legendario",
    description: "Acumula 50,000 XP en total",
    requirement: { type: "xp", value: 50000 },
    rewardCoins: 1000,
    rewardXp: 500,
    rarity: "LEGENDARY",
  },

  // Perfect sessions
  {
    code: "perfect_session",
    name: "Perfeccionista",
    description: "Completa una sesión con 100% de aciertos",
    requirement: { type: "perfect_session", value: 1 },
    rewardCoins: 100,
    rewardXp: 50,
    rarity: "RARE",
  },
];

async function seed() {
  console.log("🌱 Seeding achievements...");

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {
        name: achievement.name,
        description: achievement.description,
        requirement: achievement.requirement,
        rewardCoins: achievement.rewardCoins,
        rewardXp: achievement.rewardXp,
        rarity: achievement.rarity as any,
      },
      create: {
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        requirement: achievement.requirement,
        rewardCoins: achievement.rewardCoins,
        rewardXp: achievement.rewardXp,
        rarity: achievement.rarity as any,
      },
    });
    console.log(`  ✓ ${achievement.name}`);
  }

  console.log(`\n✅ Seeded ${achievements.length} achievements`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
