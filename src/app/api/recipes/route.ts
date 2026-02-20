import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStorageMode, isPostgresConfigured } from "@/lib/env";

const payloadSchema = z.object({
  name: z.string().min(1).max(120),
  instructions: z.string().max(8000).optional()
});

export async function GET() {
  if (getStorageMode() === "client" || !isPostgresConfigured()) {
    return NextResponse.json({
      mode: "client",
      message: "Client-side mode: recipes are stored in localStorage only."
    });
  }

  const recipes = await prisma.recipe.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, instructions: true }
  });

  return NextResponse.json({ mode: "postgres", recipes });
}

export async function POST(request: Request) {
  if (getStorageMode() === "client" || !isPostgresConfigured()) {
    return NextResponse.json(
      { mode: "client", message: "Saving to API disabled in client mode." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      name: parsed.data.name,
      instructions: parsed.data.instructions
    },
    select: { id: true, name: true, instructions: true }
  });

  return NextResponse.json(recipe, { status: 201 });
}
