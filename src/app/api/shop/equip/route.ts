import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST /api/shop/equip - Equip a theme or powerup
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

    const item = inventoryEntry.item;
    const properties = item.properties as Record<string, unknown>;

    // Handle themes
    if (item.category === "THEME") {
      const themeId = (properties.themeId as string) || "default";

      // Unequip all other themes
      await prisma.userInventory.updateMany({
        where: {
          userId: user.id,
          isEquipped: true,
          item: { category: "THEME" },
        },
        data: { isEquipped: false },
      });

      // Equip this theme and update user preference
      await prisma.$transaction([
        prisma.userInventory.update({
          where: { id: inventoryEntry.id },
          data: { isEquipped: true },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { selectedTheme: themeId },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `¡Tema "${item.name}" equipado!`,
        selectedTheme: themeId,
        themeColors: properties.colors,
      });
    }

    // Handle powerups (just mark as equipped, logic applies automatically)
    if (item.category === "POWERUP") {
      await prisma.userInventory.update({
        where: { id: inventoryEntry.id },
        data: { isEquipped: !inventoryEntry.isEquipped },
      });

      return NextResponse.json({
        success: true,
        message: inventoryEntry.isEquipped
          ? `"${item.name}" desactivado`
          : `"${item.name}" activado`,
        isEquipped: !inventoryEntry.isEquipped,
      });
    }

    return NextResponse.json({ error: "Este item no se puede equipar" }, { status: 400 });
  } catch (error) {
    console.error("Error equipping item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
