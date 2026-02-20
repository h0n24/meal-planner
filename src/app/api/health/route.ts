import { NextResponse } from "next/server";
import { getStorageMode, isPostgresConfigured } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    storageMode: getStorageMode(),
    postgresConfigured: isPostgresConfigured()
  });
}
