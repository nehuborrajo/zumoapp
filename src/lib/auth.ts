import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return null;
  }

  // Find or create user in our database
  let user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });

  if (!user) {
    // Create user on first login
    const email = supabaseUser.email!;
    const displayName = supabaseUser.user_metadata?.full_name ||
                        supabaseUser.user_metadata?.name ||
                        email.split("@")[0];

    // Generate unique username from email
    let baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    let username = baseUsername;
    let counter = 1;

    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    user = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email,
        username,
        displayName,
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
      },
    });
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
