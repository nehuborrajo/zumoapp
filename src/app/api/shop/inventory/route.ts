import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/shop/inventory - Get user's inventory
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inventory = await prisma.userInventory.findMany({
      where: { userId: user.id },
      include: {
        item: true,
      },
      orderBy: { purchasedAt: "desc" },
    });

    const formattedInventory = inventory.map((inv) => ({
      id: inv.id,
      itemId: inv.item.id,
      name: inv.item.name,
      description: inv.item.description,
      imageUrl: inv.item.imageUrl,
      category: inv.item.category,
      properties: inv.item.properties,
      quantity: inv.quantity,
      isEquipped: inv.isEquipped,
      purchasedAt: inv.purchasedAt.toISOString(),
    }));

    return NextResponse.json({
      inventory: formattedInventory,
      // Also return active boosts and streakFreezes count
      streakFreezes: user.streakFreezes,
      xpBoostActive: user.xpBoostUntil && user.xpBoostUntil > new Date(),
      xpBoostUntil: user.xpBoostUntil?.toISOString() || null,
      xpBoostMultiplier: user.xpBoostMultiplier,
      selectedTheme: user.selectedTheme,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
