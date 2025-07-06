// Server-side environment configuration
export const serverEnvironment = {
  apiUrl: process.env.VITE_API_BASE_URL || "http://localhost:9000",
  port: process.env.PORT || 8080,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
}; 