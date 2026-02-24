import { AuthResponse, Cart, Category, Order, Product } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(path: string, method: Method, token?: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store"
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", "POST", undefined, { email, password }),
  register: (payload: { fullName: string; email: string; password: string; phone?: string; address?: string }) =>
    request<AuthResponse>("/auth/register", "POST", undefined, payload),
  me: (token: string) => request<AuthResponse["user"]>("/auth/me", "GET", token),

  listProducts: () => request<Product[]>("/products", "GET"),
  getProduct: (id: number) => request<Product>(`/products/${id}`, "GET"),
  createProduct: (token: string, payload: unknown) => request<Product>("/products", "POST", token, payload),

  listCategories: () => request<Category[]>("/categories", "GET"),
  createCategory: (token: string, payload: { name: string; description?: string }) =>
    request<Category>("/categories", "POST", token, payload),

  getCart: (token: string, customerId: number) => request<Cart>(`/customers/${customerId}/cart`, "GET", token),
  addToCart: (token: string, customerId: number, productId: number, quantity: number) =>
    request<Cart>(`/customers/${customerId}/cart/items`, "POST", token, { productId, quantity }),
  updateCartItem: (token: string, customerId: number, itemId: number, quantity: number) =>
    request<Cart>(`/customers/${customerId}/cart/items/${itemId}`, "PATCH", token, { quantity }),
  removeCartItem: (token: string, customerId: number, itemId: number) =>
    request<Cart>(`/customers/${customerId}/cart/items/${itemId}`, "DELETE", token),
  checkout: (token: string, customerId: number) => request<Order>(`/customers/${customerId}/orders/checkout`, "POST", token),
  listOrders: (token: string, customerId: number) => request<Order[]>(`/customers/${customerId}/orders`, "GET", token)
};
