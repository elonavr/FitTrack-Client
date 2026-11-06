import { getToken, clearSession } from "./session";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5001/api";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

export async function apiCall<T>(
  endpoint: string,
  method: Method = "GET",
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Connection failed. Please ensure the server is running.");
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) clearSession();
    const message =
      (typeof data === "string" && data) ||
      data?.message ||
      `API Error (${response.status}): ${response.statusText}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}
