console.log('Environment Variables:', import.meta.env);
export const environment = {
  apiUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:9000",
};