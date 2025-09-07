const BASE = import.meta.env.VITE_API_URL || '/api';

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...authHeader(),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error(data?.message || res.statusText);
  return data as T;
}

export const api = {
  register: (email: string, password: string, displayName?: string) =>
    req<{ id: string; email: string; displayName?: string; createdAt: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, displayName }) }
    ),
  login: (email: string, password: string) =>
    req<{ accessToken: string; displayName?: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
  listTodos: () => req<any>('/todos', { method: 'GET' }),
  createTodo: (body: string) => req('/todos', { method: 'POST', body: JSON.stringify({ body }) }),
  updateTodo: (id: string, patch: { body?: string; isDone?: boolean }) =>
    req(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteTodo: (id: string) => req(`/todos/${id}`, { method: 'DELETE' }),
  aiSuggest: (input: string) =>
    req<{ suggestions: string[] }>('/ai/suggest', { method: 'POST', body: JSON.stringify({ input }) }),
};