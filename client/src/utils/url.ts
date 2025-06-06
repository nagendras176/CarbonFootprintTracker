import { environment } from "@/environment";

export function getApiUrl(path: string) {
  return `${environment.apiUrl}${path}`;
}