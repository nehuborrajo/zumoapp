import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/shop - Get all shop items
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all available shop items
    const items = await prisma.shopItem.findMany({
      orderBy: [
        { category: "asc" },
        { price: "asc" },
      ],
    });

    // Filter out expired limited items
    const availableItems = items.filter((item) => {
      if (!item.isLimited) return true;
      if (!item.availableUntil) return true;
      return item.availableUntil >= new Date();
    });

    // Get user's inventory to mark owned items
    const inventory = await prisma.userInventory.findMany({
      where: { userId: user.id },
      select: { itemId: true, quantity: true, isEquipped: true },
    });

    const inventoryMap = new Map(
      inventory.map((inv) => [inv.itemId, { quantity: inv.quantity, isEquipped: inv.isEquipped }])
    );

    // Format response
    const formattedItems = availableItems.map((item) => {
      const owned = inventoryMap.get(item.id);
      return {
        id: item.id,
        category: item.category,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        isPremiumOnly: item.isPremiumOnly,
        isLimited: item.isLimited,
        availableUntil: item.availableUntil?.toISOString() || null,
        properties: item.properties,
        // Ownership info
        owned: !!owned,
        quantity: owned?.quantity || 0,
        isEquipped: owned?.isEquipped || false,
      };
    });

    return NextResponse.json({
      items: formattedItems,
      userCoins: user.coins,
      isPremium: user.isPremium,
    });
  } catch (error) {
    console.error("Error fetching shop items:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("Stack:", errorStack);
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}
