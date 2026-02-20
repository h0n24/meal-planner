export function getStorageMode() {
  return process.env.NEXT_PUBLIC_STORAGE_MODE === "client" ? "client" : "postgres";
}

export function isPostgresConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
