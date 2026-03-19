import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST /api/shop/use - Use a consumable item
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // Get user's inventory entry for this item
    const inventoryEntry = await prisma.userInventory.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: itemId,
        },
      },
      include: { item: true },
    });

    if (!inventoryEntry) {
      return NextResponse.json({ error: "No tienes este item" }, { status: 404 });
    }

    if (inventoryEntry.quantity <= 0) {
      return NextResponse.json({ error: "No te quedan usos de este item" }, { status: 400 });
    }

    const properties = inventoryEntry.item.properties as Record<string, unknown>;
    const itemType = properties.type as string;

    // Handle different item types
    switch (itemType) {
      case "streak_freeze": {
        // Add streak freeze to user
        await prisma.$transaction([
          prisma.userInventory.update({
            where: { id: inventoryEntry.id },
            data: { quantity: { decrement: 1 } },
          }),
          prisma.user.update({
            where: { id: user.id },
            data: { streakFreezes: { increment: 1 } },
          }),
        ]);

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { streakFreezes: true },
        });

        return NextResponse.json({
          success: true,
          message: "¡Streak Freeze activado! Se usará automáticamente si no estudias mañana.",
          streakFreezes: updatedUser?.streakFreezes || 0,
        });
      }

      case "xp_boost": {
        const multiplier = (properties.multiplier as number) || 2;
        const durationMinutes = (properties.durationMinutes as number) || 60;
        const boostUntil = new Date(Date.now() + durationMinutes * 60 * 1000);

        // Check if there's already an active boost
        if (user.xpBoostUntil && user.xpBoostUntil > new Date()) {
          return NextResponse.json({
            error: "Ya tienes un XP Boost activo. Espera a que termine.",
            xpBoostUntil: user.xpBoostUntil.toISOString(),
          }, { status: 400 });
        }

        await prisma.$transaction([
          prisma.userInventory.update({
            where: { id: inventoryEntry.id },
            data: { quantity: { decrement: 1 } },
          }),
          prisma.user.update({
            where: { id: user.id },
            data: {
              xpBoostUntil: boostUntil,
              xpBoostMultiplier: multiplier,
            },
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: `¡XP Boost x${multiplier} activado por ${durationMinutes} minutos!`,
          xpBoostUntil: boostUntil.toISOString(),
          xpBoostMultiplier: multiplier,
        });
      }

      default:
        return NextResponse.json({ error: "Este item no es consumible" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error using item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
