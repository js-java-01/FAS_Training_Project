const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

interface ApiError extends Error {
  status: number;
  body: unknown;
}

async function handleResponse(res: Response) {
  const txt = await res.text();
  const data = txt ? JSON.parse(txt) : null;
  if (!res.ok) {
    const err = data?.message || res.statusText || "Request failed";
    const e = new Error(err) as ApiError;
    e.status = res.status;
    e.body = data;
    throw e;
  }
  return data;
}

export const moduleGroupApi = {
  async list(params?: { page?: number; size?: number }) {
    const q = new URLSearchParams();
    if (params?.page != null) q.set("page", String(params.page));
    if (params?.size != null) q.set("size", String(params.size));
    const res = await fetch(`${API_BASE}/moduleGroups?${q.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
    });
    return handleResponse(res);
  },

  async getById(id: string) {
    const res = await fetch(`${API_BASE}/moduleGroups/${id}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
    });
    return handleResponse(res);
  },

  async create(payload: { name: string; description?: string; displayOrder?: number; isActive?: boolean }) {
    const res = await fetch(`${API_BASE}/moduleGroups`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async update(id: string, payload: { name?: string; description?: string; displayOrder?: number; isActive?: boolean }) {
    const res = await fetch(`${API_BASE}/moduleGroups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Ân
  async delete(id: string) {
    const res = await fetch(`${API_BASE}/moduleGroups/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  }
};
