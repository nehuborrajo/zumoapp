import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST /api/shop/buy - Purchase an item
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

    // Get the item
    const item = await prisma.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if item is available (not expired limited item)
    if (item.isLimited && item.availableUntil && item.availableUntil < new Date()) {
      return NextResponse.json({ error: "Este item ya no está disponible" }, { status: 400 });
    }

    // Check if premium only
    if (item.isPremiumOnly && !user.isPremium) {
      return NextResponse.json({ error: "Este item es solo para usuarios premium" }, { status: 403 });
    }

    // Check if user has enough coins
    if (user.coins < item.price) {
      return NextResponse.json({
        error: "No tienes suficientes monedas",
        required: item.price,
        available: user.coins,
      }, { status: 400 });
    }

    // Check if user already owns this item (for non-consumables)
    const existingInventory = await prisma.userInventory.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: item.id,
        },
      },
    });

    const isConsumable = item.category === "CONSUMABLE";
    const properties = item.properties as Record<string, unknown>;

    // For non-consumables, prevent duplicate purchase
    if (!isConsumable && existingInventory) {
      return NextResponse.json({ error: "Ya tienes este item" }, { status: 400 });
    }

    // Process purchase in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct coins
      await tx.user.update({
        where: { id: user.id },
        data: { coins: { decrement: item.price } },
      });

      // Handle consumables with quantity
      if (isConsumable && existingInventory) {
        // Add quantity to existing inventory
        const quantityToAdd = (properties.quantity as number) || 1;
        await tx.userInventory.update({
          where: { id: existingInventory.id },
          data: { quantity: { increment: quantityToAdd } },
        });
      } else {
        // Create new inventory entry
        const initialQuantity = isConsumable ? ((properties.quantity as number) || 1) : 1;
        await tx.userInventory.create({
          data: {
            userId: user.id,
            itemId: item.id,
            quantity: initialQuantity,
          },
        });
      }

      // Get updated user
      const updatedUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { coins: true },
      });

      return { newBalance: updatedUser?.coins || 0 };
    });

    return NextResponse.json({
      success: true,
      message: `¡Compraste ${item.name}!`,
      newBalance: result.newBalance,
      item: {
        id: item.id,
        name: item.name,
        category: item.category,
      },
    });
  } catch (error) {
    console.error("Error purchasing item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
